import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Input,
  Textarea,
  Button,
  Radio,
  Progress,
  Avatar,
} from "@material-tailwind/react";
import { CiUser } from "react-icons/ci";
import { FaUpload, FaTrash } from "react-icons/fa";
import CharacterService from "@/services/characterService";
import { deleteCharacterImage } from "@/stores/reducers/characters";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const CharacterForm = ({
  character = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    characterName: character?.characterName || "",
    characterType: character?.characterType || "human",
    // Human fields
    age: character?.age || "",
    gender: character?.gender || "",
    ethnicity: character?.ethnicity || "",
    hairColor: character?.hairColor || "",
    eyeColor: character?.eyeColor || "",
    // Pet fields
    petType: character?.petType || "",
    breed: character?.breed || "",
    fur: character?.fur || "",
    ears: character?.ears || "",
    tail: character?.tail || "",
    // Common fields
    personality: character?.personality || "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(
    character?.referenceImageUrl || null
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      characterType: type,
      // Clear type-specific fields when switching
      ...(type === "human"
        ? {
            petType: "",
            breed: "",
            fur: "",
            ears: "",
            tail: "",
          }
        : {
            age: "",
            gender: "",
            ethnicity: "",
            hairColor: "",
            eyeColor: "",
          }),
    }));

    // Clear preview image if switching to human
    if (type === "human") {
      setPreviewImage(null);
      setSelectedFile(null);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Character name validation
    if (!formData.characterName.trim()) {
      errors.characterName = t("characters.errors.nameRequired");
    } else if (formData.characterName.trim().length < 2) {
      errors.characterName = t("characters.errors.nameMinLength");
    }

    // Type-specific validation
    if (formData.characterType === "human") {
      if (!formData.age) {
        errors.age = t("characters.errors.ageRequired");
      } else if (isNaN(formData.age) || formData.age < 0) {
        errors.age = t("characters.errors.ageInvalid");
      }

      if (!formData.gender) {
        errors.gender = t("characters.errors.genderRequired");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = CharacterService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    if (formData.characterType === "pet") {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = async () => {
    // If this is an existing character with a reference image, delete it from S3 and MongoDB
    if (character?.id && character?.referenceImageUrl) {
      try {
        const result = await dispatch(deleteCharacterImage(character.id));

        if (deleteCharacterImage.fulfilled.match(result)) {
          toast.success(t("characters.imageDeleteSuccess"));
          // Clear the preview and selected file
          setPreviewImage(null);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          toast.error(t("characters.imageDeleteFailed"));
          logger.error("Failed to delete character image:", result.payload);
        }
      } catch (error) {
        toast.error(t("characters.imageDeleteFailed"));
        logger.error("Error deleting character image:", error);
      }
    } else {
      // If it's just a preview (new upload), clear it locally
      setPreviewImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare form data for submission
      const submitData = {
        character_name: formData.characterName.trim(),
        character_type: formData.characterType,
        personality: formData.personality.trim() || null,
      };

      // Debug logging to see what data is being submitted
      logger.info("Character form submission data:", submitData);

      // Add type-specific fields
      if (formData.characterType === "human") {
        submitData.age = parseInt(formData.age);
        submitData.gender = formData.gender;
        if (formData.ethnicity.trim())
          submitData.ethnicity = formData.ethnicity.trim();
        if (formData.hairColor.trim())
          submitData.hair_color = formData.hairColor.trim();
        if (formData.eyeColor.trim())
          submitData.eye_color = formData.eyeColor.trim();
      } else {
        if (formData.petType.trim())
          submitData.pet_type = formData.petType.trim();
        if (formData.breed.trim()) submitData.breed = formData.breed.trim();
        if (formData.fur.trim()) submitData.fur = formData.fur.trim();
        if (formData.ears.trim()) submitData.ears = formData.ears.trim();
        if (formData.tail.trim()) submitData.tail = formData.tail.trim();
      }

      await onSubmit(submitData, selectedFile);
    } catch (error) {
      logger.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-custom-light-yellow text-white p-4">
        <Typography variant="h5" className="text-white">
          {character
            ? t("characters.editCharacter")
            : t("characters.createCharacter")}
        </Typography>
      </CardHeader>

      <CardBody className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Type Selection */}
          <div>
            <Typography variant="h6" className="mb-3">
              {t("characters.characterType")}
            </Typography>
            <div className="flex gap-6">
              <div className="flex items-center">
                <Radio
                  name="characterType"
                  value="human"
                  checked={formData.characterType === "human"}
                  onChange={() => handleTypeChange("human")}
                  label={t("characters.human")}
                />
              </div>
              <div className="flex items-center">
                <Radio
                  name="characterType"
                  value="pet"
                  checked={formData.characterType === "pet"}
                  onChange={() => handleTypeChange("pet")}
                  label={t("characters.pet")}
                />
              </div>
            </div>
          </div>

          {/* Character Name */}
          <div>
            <Typography variant="small" className="text-gray-600 mb-1">
              {t("characters.characterName")} *
            </Typography>
            <Input
              value={formData.characterName}
              onChange={(e) =>
                handleInputChange("characterName", e.target.value)
              }
              error={!!formErrors.characterName}
              placeholder={t("characters.characterNamePlaceholder")}
            />
            {formErrors.characterName && (
              <Typography variant="small" className="text-red-500 mt-1">
                {formErrors.characterName}
              </Typography>
            )}
          </div>

          {/* Pet Reference Image */}
          {formData.characterType === "pet" && (
            <div>
              <Typography variant="small" className="text-gray-600 mb-3">
                {t("characters.referenceImage")}
              </Typography>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
              />

              <div className="flex items-center space-x-4">
                {/* Image preview */}
                <div
                  className="relative cursor-pointer"
                  onClick={handleImageClick}
                >
                  {previewImage ? (
                    <Avatar
                      variant="rounded"
                      alt="Preview"
                      className="h-20 w-20"
                      src={previewImage}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-400">
                      <FaUpload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload/Remove buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outlined"
                    onClick={handleImageClick}
                    className="flex items-center space-x-2"
                  >
                    <FaUpload className="h-3 w-3" />
                    <span>
                      {previewImage ? t("common.change") : t("common.upload")}
                    </span>
                  </Button>

                  {previewImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outlined"
                      color="red"
                      onClick={handleRemoveImage}
                      className="flex items-center space-x-2"
                    >
                      <FaTrash className="h-3 w-3" />
                      <span>{t("common.remove")}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Upload progress */}
              {isUploadingImage && (
                <div className="mt-3">
                  <Progress value={uploadProgress} className="h-2" />
                  <Typography variant="small" className="text-gray-600 mt-1">
                    {t("common.uploading")} {Math.round(uploadProgress)}%
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Type-specific fields */}
          {formData.characterType === "human" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.age")} *
                </Typography>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  error={!!formErrors.age}
                  placeholder={t("characters.agePlaceholder")}
                  min="0"
                />
                {formErrors.age && (
                  <Typography variant="small" className="text-red-500 mt-1">
                    {formErrors.age}
                  </Typography>
                )}
              </div>

              {/* Gender */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-3">
                  {t("characters.gender")} *
                </Typography>
                <div className="flex gap-6">
                  <div className="flex items-center">
                    <Radio
                      name="gender"
                      value="boy"
                      checked={formData.gender === "boy"}
                      onChange={() => handleInputChange("gender", "boy")}
                      label={t("characters.boy")}
                    />
                  </div>
                  <div className="flex items-center">
                    <Radio
                      name="gender"
                      value="girl"
                      checked={formData.gender === "girl"}
                      onChange={() => handleInputChange("gender", "girl")}
                      label={t("characters.girl")}
                    />
                  </div>
                </div>
                {formErrors.gender && (
                  <Typography variant="small" className="text-red-500 mt-1">
                    {formErrors.gender}
                  </Typography>
                )}
              </div>

              {/* Ethnicity */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.ethnicity")}
                </Typography>
                <Input
                  value={formData.ethnicity}
                  onChange={(e) =>
                    handleInputChange("ethnicity", e.target.value)
                  }
                  placeholder={t("characters.ethnicityPlaceholder")}
                />
              </div>

              {/* Hair Color */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.hairColor")}
                </Typography>
                <Input
                  value={formData.hairColor}
                  onChange={(e) =>
                    handleInputChange("hairColor", e.target.value)
                  }
                  placeholder={t("characters.hairColorPlaceholder")}
                />
              </div>

              {/* Eye Color */}
              <div className="md:col-span-2">
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.eyeColor")}
                </Typography>
                <Input
                  value={formData.eyeColor}
                  onChange={(e) =>
                    handleInputChange("eyeColor", e.target.value)
                  }
                  placeholder={t("characters.eyeColorPlaceholder")}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pet Type */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.petType")}
                </Typography>
                <Input
                  value={formData.petType}
                  onChange={(e) => handleInputChange("petType", e.target.value)}
                  placeholder={t("characters.petTypePlaceholder")}
                />
              </div>

              {/* Breed */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.breed")}
                </Typography>
                <Input
                  value={formData.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  placeholder={t("characters.breedPlaceholder")}
                />
              </div>

              {/* Fur */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.fur")}
                </Typography>
                <Input
                  value={formData.fur}
                  onChange={(e) => handleInputChange("fur", e.target.value)}
                  placeholder={t("characters.furPlaceholder")}
                />
              </div>

              {/* Ears */}
              <div>
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.ears")}
                </Typography>
                <Input
                  value={formData.ears}
                  onChange={(e) => handleInputChange("ears", e.target.value)}
                  placeholder={t("characters.earsPlaceholder")}
                />
              </div>

              {/* Tail */}
              <div className="md:col-span-2">
                <Typography variant="small" className="text-gray-600 mb-1">
                  {t("characters.tail")}
                </Typography>
                <Input
                  value={formData.tail}
                  onChange={(e) => handleInputChange("tail", e.target.value)}
                  placeholder={t("characters.tailPlaceholder")}
                />
              </div>
            </div>
          )}

          {/* Personality */}
          <div>
            <Typography variant="small" className="text-gray-600 mb-1">
              {t("characters.personality")}
            </Typography>
            <Textarea
              value={formData.personality}
              onChange={(e) => handleInputChange("personality", e.target.value)}
              placeholder={t("characters.personalityPlaceholder")}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading
                ? t("common.saving")
                : character
                ? t("common.update")
                : t("common.create")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default CharacterForm;
