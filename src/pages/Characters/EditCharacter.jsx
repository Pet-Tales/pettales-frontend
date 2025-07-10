import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { toast } from "react-toastify";

import CharacterForm from "@/components/Characters/CharacterForm";
import {
  fetchCharacterById,
  updateCharacter,
  uploadCharacterImage,
  clearCurrentCharacter,
} from "@/stores/reducers/characters";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";

const EditCharacter = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();
  const { id } = useParams();

  const { currentCharacter, isLoading } = useSelector(
    (state) => state.characters
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [characterNotFound, setCharacterNotFound] = useState(false);

  // Load character data
  useEffect(() => {
    if (id) {
      dispatch(fetchCharacterById(id)).then((result) => {
        if (fetchCharacterById.rejected.match(result)) {
          const status = result.payload?.status;
          const errorMessage =
            result.payload?.message || t("characters.characterNotFound");

          // Redirect to appropriate error page based on status
          if (status === 404) {
            navigate("/404", { replace: true });
          } else if (status >= 500) {
            navigate("/error/500", { replace: true });
          } else if (status === 400) {
            // Invalid character ID format - redirect to 404
            navigate("/404", { replace: true });
          } else {
            // For other errors, show toast and set not found state
            setCharacterNotFound(true);
            const translatedError = translateError(errorMessage);
            toast.error(translatedError);
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentCharacter());
    };
  }, [id, dispatch, navigate]); // Removed translateError from dependencies

  const handleSubmit = async (characterData, imageFile) => {
    if (!currentCharacter) return;

    setIsUpdating(true);

    try {
      // Step 1: Update the character data
      const updateResult = await dispatch(
        updateCharacter({
          characterId: currentCharacter.id,
          updateData: characterData,
        })
      );

      if (updateCharacter.fulfilled.match(updateResult)) {
        // Step 2: Upload new image if provided (for both human and pet characters)
        if (imageFile) {
          try {
            const uploadResult = await dispatch(
              uploadCharacterImage({
                characterId: currentCharacter.id,
                file: imageFile,
              })
            );

            if (uploadCharacterImage.fulfilled.match(uploadResult)) {
              toast.success(t("characters.updateSuccessWithImage"));
            } else {
              // Character updated but image upload failed
              toast.warning(t("characters.updateSuccessImageFailed"));
              logger.warn(
                "Character updated but image upload failed:",
                uploadResult.payload
              );
            }
          } catch (imageError) {
            // Character updated but image upload failed
            toast.warning(t("characters.updateSuccessImageFailed"));
            logger.error("Image upload error:", imageError);
          }
        } else {
          toast.success(t("characters.updateSuccess"));
        }

        // Navigate back to character detail page
        navigate(`/characters/${currentCharacter.id}`);
      } else {
        // Handle validation errors
        const errorMessage = translateError(
          updateResult.payload?.message ||
            t("characters.failedToUpdateCharacter")
        );
        toast.error(errorMessage);

        // Log detailed error for debugging
        logger.error("Update character error:", updateResult.payload);
      }
    } catch (error) {
      logger.error("Character update process error:", error);
      const errorMessage = translateError(
        error?.message || t("characters.failedToUpdateCharacter")
      );
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/characters/${currentCharacter.id}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state (only when explicitly set, not when currentCharacter is null during loading)
  if (characterNotFound) {
    return (
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("characters.characterNotFound")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("characters.characterNotFoundDescription")}
            </p>
            <button
              onClick={() => navigate("/characters")}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {t("characters.backToCharacters")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if we don't have character data yet (and not in error state)
  if (!currentCharacter && !characterNotFound) {
    return (
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <CharacterForm
          character={currentCharacter}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
};

export default EditCharacter;
