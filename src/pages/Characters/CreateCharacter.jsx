import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import CharacterForm from "@/components/Characters/CharacterForm";
import {
  createCharacter,
  uploadCharacterImage,
} from "@/stores/reducers/characters";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";

const CreateCharacter = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (characterData, imageFile) => {
    setIsLoading(true);

    try {
      // Debug logging
      logger.info("Creating character with data:", characterData);
      logger.info("Image file provided:", !!imageFile);

      // Step 1: Create the character
      const createResult = await dispatch(createCharacter(characterData));

      if (createCharacter.fulfilled.match(createResult)) {
        const newCharacter = createResult.payload;

        // Step 2: Upload image if provided (only for pets)
        if (imageFile && characterData.character_type === "pet") {
          try {
            const uploadResult = await dispatch(
              uploadCharacterImage({
                characterId: newCharacter.id,
                file: imageFile,
              })
            );

            if (uploadCharacterImage.fulfilled.match(uploadResult)) {
              toast.success(t("characters.createSuccessWithImage"));
            } else {
              // Character created but image upload failed
              toast.warning(t("characters.createSuccessImageFailed"));
              logger.warn(
                "Character created but image upload failed:",
                uploadResult.payload
              );
            }
          } catch (imageError) {
            // Character created but image upload failed
            toast.warning(t("characters.createSuccessImageFailed"));
            logger.error("Image upload error:", imageError);
          }
        } else {
          toast.success(t("characters.createSuccess"));
        }

        // Navigate back to characters list
        navigate("/characters");
      } else {
        // Handle validation errors
        const errorMessage = translateError(
          createResult.payload?.message || "Failed to create character"
        );
        toast.error(errorMessage);

        // Log detailed error for debugging
        logger.error("Create character error:", createResult.payload);
      }
    } catch (error) {
      logger.error("Character creation process error:", error);
      const errorMessage = translateError(
        error?.message || "Failed to create character"
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/characters");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CharacterForm
            character={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateCharacter;
