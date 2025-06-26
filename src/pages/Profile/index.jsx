import { useState, useEffect } from "react";
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
} from "@material-tailwind/react";

import ProtectedRoute from "@/components/ProtectedRoute";
import LanguageUtils from "@/utils/languageUtils";
import { setUser } from "@/stores/reducers/auth";
import logger from "@/utils/logger";

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
];

const Profile = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.preferredLanguage || "en"
  );
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  useEffect(() => {
    // Update selected language when user data changes
    if (user?.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                <CardHeader className="bg-custom-light-yellow text-white p-6">
                  <Typography variant="h5" className="text-white">
                    {t("profile.personalInfo")}
                  </Typography>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="flex items-center mb-6">
                    {user?.profileImageUrl ? (
                      <Avatar
                        variant="circular"
                        alt={user?.firstName || "User"}
                        className="h-20 w-20 mr-4"
                        src={user.profileImageUrl}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                        <CiUser className="h-10 w-10 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <Typography variant="h6" className="text-gray-900">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName ||
                            user?.email?.split("@")[0] ||
                            "User"}
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        {user?.email}
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-1"
                      >
                        {t("profile.firstName")}
                      </Typography>
                      <Input
                        value={user?.firstName || ""}
                        disabled
                        className="!border-gray-300"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-1"
                      >
                        {t("profile.lastName")}
                      </Typography>
                      <Input
                        value={user?.lastName || ""}
                        disabled
                        className="!border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-1"
                      >
                        {t("profile.email")}
                      </Typography>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="!border-gray-300"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Settings Card */}
            <div>
              <Card>
                <CardHeader className="bg-custom-light-yellow text-white p-6">
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
                      {LANGUAGES.map((language) => (
                        <Option key={language.code} value={language.code}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.name}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                    {isUpdatingLanguage && (
                      <Typography
                        variant="small"
                        className="text-gray-500 mt-1"
                      >
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
                          {user?.emailVerified
                            ? t("common.yes")
                            : t("common.no")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
