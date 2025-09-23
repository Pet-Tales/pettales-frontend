import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { CiUser } from "react-icons/ci";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Avatar,
  Select,
  Option,
  Input,
  Button,
  Progress,
} from "@material-tailwind/react";
import { toast } from "react-toastify";

import LanguageUtils from "@/utils/languageUtils";
import { useErrorTranslation } from "@/utils/errorMapper";
import {
  setUser,
  requestPasswordChange,
  updateProfile,
} from "@/stores/reducers/auth";
import AvatarService from "@/services/avatar";
import logger from "@/utils/logger";

const getLanguages = (t) => [
  {
    code: "en",
    name: t("languages.english"),
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: t("languages.spanish"),
    flag: "🇪🇸",
  },
];

const Profile = () => {
  const { t } = useValidatedTranslation();
  const translateError = useErrorTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.preferredLanguage || "en"
  );
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update selected language when user data changes
    if (user?.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);


  const handleLanguageChange = async (language) => {
    if (language === selectedLanguage) return;

    setIsUpdatingLanguage(true);
    try {
      await LanguageUtils.changeLanguage(
        language,
        isAuthenticated,
        (updatedUser) => dispatch(setUser(updatedUser))
      );
      setSelectedLanguage(language);
    } catch (error) {
      logger.error("Error updating language:", error);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    const result = await dispatch(requestPasswordChange());

    if (requestPasswordChange.fulfilled.match(result)) {
      toast.success(t("profile.passwordResetEmailSent"));
    } else {
      const errorMessage = translateError(
        error || t("profile.failedToSendPasswordReset")
      );
      toast.error(errorMessage);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (profileForm.firstName && profileForm.firstName.trim().length < 2) {
      errors.firstName = t("profile.firstNameRequired");
    }

    if (profileForm.lastName && profileForm.lastName.trim().length < 2) {
      errors.lastName = t("profile.lastNameRequired");
    }

    if (
      profileForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)
    ) {
      errors.email = t("profile.validEmailRequired");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form to original values
      setProfileForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
      });
      setFormErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const result = await dispatch(updateProfile(profileForm));

      if (updateProfile.fulfilled.match(result)) {
        toast.success(t("toast.profileUpdated"));

        // If email change was requested, show additional message
        if (profileForm.email !== user?.email) {
          toast.info(t("toast.emailChangeVerificationSent"));
        }

        setIsEditing(false);
        setFormErrors({});
      } else {
        const errorMessage = translateError(
          result.payload || t("profile.failedToUpdateProfile")
        );
        toast.error(errorMessage);
      }
    } catch (error) {
      logger.error("Profile update error:", error);
      const errorMessage = translateError(
        error?.message || t("profile.failedToUpdateProfile")
      );
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Avatar upload functions
  const handleAvatarClick = () => {
    if (isEditing && !isUploadingAvatar) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = AvatarService.validateAvatarFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target.result);
    };
    reader.readAsDataURL(file);

    // Start upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setIsUploadingAvatar(true);
    setUploadProgress(0);

    try {
      const result = await AvatarService.uploadAvatar(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result.data.success) {
        // Update user data in Redux store
        dispatch(setUser(result.data.data.user));
        toast.success(t("toast.avatarUpdated"));
        setPreviewAvatar(null);
      } else {
        throw new Error(result.data.message || t("profile.uploadFailed"));
      }
    } catch (error) {
      logger.error("Avatar upload error:", error);
      const errorMessage = translateError(
        error?.message || t("profile.failedToUploadAvatar")
      );
      toast.error(errorMessage);
      setPreviewAvatar(null);
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("profile.title")}
          </h1>
          <p className="text-lg text-gray-600">{t("profile.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="bg-custom-light-yellow text-white p-4">
                <div className="flex justify-between items-center">
                  <Typography variant="h5" className="text-white">
                    {t("profile.personalInfo")}
                  </Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    className="border-white text-white hover:bg-white hover:text-custom-light-yellow"
                    onClick={handleEditToggle}
                    disabled={isUpdatingProfile}
                  >
                    {isEditing ? t("profile.cancel") : t("profile.editProfile")}
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                    />

                    {/* Avatar display with click handler */}
                    <div
                      className={`relative ${
                        isEditing ? "cursor-pointer" : ""
                      }`}
                      onClick={handleAvatarClick}
                    >
                      {previewAvatar ? (
                        <Avatar
                          variant="circular"
                          alt={t("common.preview")}
                          className="h-20 w-20 mr-4"
                          src={previewAvatar}
                        />
                      ) : user?.profileImageUrl ? (
                        <Avatar
                          variant="circular"
                          alt={user?.firstName || t("profile.user")}
                          className="h-20 w-20 mr-4"
                          src={user.profileImageUrl}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <CiUser className="h-10 w-10 text-gray-600" />
                        </div>
                      )}

                      {/* Upload overlay in edit mode */}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center mr-4 opacity-0 hover:opacity-100 transition-opacity">
                          <Typography
                            variant="small"
                            className="text-white text-center text-xs"
                          >
                            {t("profile.changeAvatar")}
                          </Typography>
                        </div>
                      )}

                      {/* Upload progress */}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-75 rounded-full flex items-center justify-center mr-4">
                          <div className="text-center">
                            <Progress
                              value={uploadProgress}
                              size="sm"
                              className="mb-1 w-12"
                              color="blue"
                            />
                            <Typography
                              variant="small"
                              className="text-white text-xs"
                            >
                              {Math.round(uploadProgress)}%
                            </Typography>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Typography variant="h6" className="text-gray-900">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.firstName ||
                          user?.email?.split("@")[0] ||
                          t("profile.user")}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      {user?.email}
                    </Typography>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      {t("profile.firstName")}
                    </Typography>
                    <Input
                      value={
                        isEditing
                          ? profileForm.firstName
                          : user?.firstName || ""
                      }
                      disabled={!isEditing}
                      className={`${!isEditing ? "!border-gray-300" : ""} ${
                        formErrors.firstName ? "!border-red-500" : ""
                      }`}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      error={!!formErrors.firstName}
                    />
                    {formErrors.firstName && (
                      <Typography variant="small" className="text-red-500 mt-1">
                        {formErrors.firstName}
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      {t("profile.lastName")}
                    </Typography>
                    <Input
                      value={
                        isEditing ? profileForm.lastName : user?.lastName || ""
                      }
                      disabled={!isEditing}
                      className={`${!isEditing ? "!border-gray-300" : ""} ${
                        formErrors.lastName ? "!border-red-500" : ""
                      }`}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      error={!!formErrors.lastName}
                    />
                    {formErrors.lastName && (
                      <Typography variant="small" className="text-red-500 mt-1">
                        {formErrors.lastName}
                      </Typography>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Typography variant="small" className="text-gray-600 mb-1">
                      {t("profile.email")}
                    </Typography>
                    <Input
                      value={isEditing ? profileForm.email : user?.email || ""}
                      disabled={!isEditing}
                      className={`${!isEditing ? "!border-gray-300" : ""} ${
                        formErrors.email ? "!border-red-500" : ""
                      }`}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      error={!!formErrors.email}
                      type="email"
                    />
                    {formErrors.email && (
                      <Typography variant="small" className="text-red-500 mt-1">
                        {formErrors.email}
                      </Typography>
                    )}
                    {user?.pendingEmailChange && (
                      <Typography
                        variant="small"
                        className="text-blue-600 mt-1"
                      >
                        {t("profile.pendingEmailChange")}:{" "}
                        {user.pendingEmailChange}
                      </Typography>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      disabled={isUpdatingProfile}
                    >
                      {t("profile.cancel")}
                    </Button>
                    <Button
                      className="bg-custom-light-yellow hover:bg-custom-light-yellow/90"
                      onClick={handleSaveProfile}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile
                        ? t("profile.savingChanges")
                        : t("profile.saveChanges")}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Settings Card */}
          <div className="flex flex-col gap-12">
            <Card>
              <CardHeader className="bg-custom-light-yellow text-white p-4">
                <Typography variant="h5" className="text-white">
                  {t("profile.settings")}
                </Typography>
              </CardHeader>
              <CardBody className="p-6">
                {/* Language Selection */}
                <div className="mb-6">
                  <Typography variant="small" className="text-gray-600 mb-2">
                    {t("profile.language")}
                  </Typography>
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    disabled={isUpdatingLanguage}
                    className="!border-gray-300"
                  >
                    {getLanguages(t).map((language) => (
                      <Option key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                  {isUpdatingLanguage && (
                    <Typography variant="small" className="text-gray-500 mt-1">
                      {t("profile.updatingLanguage")}
                    </Typography>
                  )}
                </div>

                {/* Account Stats */}
                <div className="border-t pt-4">
                  <Typography variant="small" className="text-gray-600 mb-2">
                    {t("profile.accountStats")}
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("profile.credits")}:
                      </span>
                      <span className="text-sm font-medium">
                        {user?.creditsBalance || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("profile.emailVerified")}:
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          user?.emailVerified
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {user?.emailVerified ? t("common.yes") : t("common.no")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Password & Security Card */}
            <Card>
              <CardHeader className="bg-custom-light-yellow text-white p-4">
                <Typography variant="h5" className="text-white">
                  {t("profile.passwordSecurity")}
                </Typography>
              </CardHeader>
              <CardBody className="p-6">
                <div>
                  <Typography variant="small" className="text-gray-600 mb-4">
                    {t("profile.passwordResetDescription")}
                  </Typography>
                  <Button
                    onClick={handleRequestPasswordChange}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                  >
                    {isLoading
                      ? t("profile.sending")
                      : t("profile.changePassword")}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
