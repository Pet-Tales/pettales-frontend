import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { CiUser } from "react-icons/ci";
import { logout, setUser } from "@/stores/reducers/auth";
import logger from "@/utils/logger";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import LanguageUtils from "@/utils/languageUtils";

import {
  Navbar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Typography,
} from "@material-tailwind/react";

const MENU_ITEMS = [
  {
    labelKey: "navbar.home",
    path: "/",
    isAuthRequired: false,
    subRoute: ["/"],
  },
  {
    labelKey: "navbar.myBooks",
    path: "/my-books",
    isAuthRequired: true,
    subRoute: ["/my-books"],
  },
  {
    labelKey: "navbar.characters",
    path: "/characters",
    isAuthRequired: true,
    subRoute: ["/characters"],
  },
  {
    labelKey: "navbar.gallery",
    path: "/gallery",
    isAuthRequired: false,
    subRoute: ["/gallery"],
  },
  {
    labelKey: "navbar.pricing",
    path: "/pricing",
    isAuthRequired: false,
    subRoute: ["/pricing"],
  },
  {
    labelKey: "navbar.howItWork",
    path: "/guide",
    isAuthRequired: false,
    subRoute: ["/guide"],
  },
];

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

const PTAINavBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUrl = useLocation().pathname;
  const { t, i18n } = useValidatedTranslation();
  const {
    user,
    isAuthenticated,
    isLoading,
    hasAttemptedAuth,
    isValidatingSession,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Don't make duplicate calls - let App component handle session validation
    // Only try to get current user if we haven't attempted auth yet, not currently loading, and not already validating
    if (!hasAttemptedAuth && !isLoading && !isValidatingSession) {
      logger.info(
        "Navbar: Session validation not started, skipping duplicate call"
      );
      // Don't dispatch getCurrentUser here - let App component handle it
    }
  }, [dispatch, hasAttemptedAuth, isLoading, isValidatingSession]);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate("/");
    } catch (error) {
      // Even if logout fails on server, clear local state
      logger.error("Logout error:", error);
      navigate("/");
    }
  };

  const handleLanguageChange = async (languageCode) => {
    if (languageCode === i18n.language) return;

    try {
      await LanguageUtils.changeLanguage(
        languageCode,
        isAuthenticated,
        (updatedUser) => dispatch(setUser(updatedUser))
      );
    } catch (error) {
      logger.error("Error updating language in navbar:", error);
    }
  };

  const getCurrentLanguage = () => {
    const languages = getLanguages(t);
    return (
      languages.find((lang) => lang.code === i18n.language) || languages[0]
    );
  };

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (item.isAuthRequired && !isAuthenticated) {
      return false;
    }
    return true;
  });

  return (
    <Navbar className="top-0 z-50 rounded-none fixed p-3.5 !max-w-full bg-white bg-opacity-100 border-white border-opacity-100 backdrop-saturate-0 backdrop-blur-none text-black">
      <div className="flex justify-between">
        <div className="flex gap-6">
          <img
            src="/logo-text-1.png"
            width={220}
            className="cursor-pointer"
            onClick={() => navigate("/")}
          />

          {filteredMenuItems.map((item) => {
            return (
              <Menu key={item.path} allowHover>
                <span
                  className={`cursor-pointer self-center ${
                    item.subRoute.includes(currentUrl)
                      ? "text-custom-light-yellow"
                      : "text-custom-black"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {t(item.labelKey)}
                </span>
              </Menu>
            );
          })}
        </div>
        <div className="flex gap-4 items-center">
          {/* Language Dropdown */}
          <Menu>
            <MenuHandler>
              <div className="flex items-center gap-1 cursor-pointer hover:text-custom-light-yellow">
                <span className="text-lg">{getCurrentLanguage().flag}</span>
                <span className="text-sm">{getCurrentLanguage().name}</span>
              </div>
            </MenuHandler>
            <MenuList>
              {getLanguages(t).map((language) => (
                <MenuItem
                  key={language.code}
                  className="flex gap-2 items-center"
                  onClick={() => handleLanguageChange(language.code)}
                >
                  <span className="text-lg">{language.flag}</span>
                  <Typography variant="small" className="font-normal">
                    {language.name}
                  </Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {!isAuthenticated ? (
            <>
              <p
                className="self-center cursor-pointer hover:text-custom-light-yellow"
                onClick={() => navigate("/login")}
              >
                {t("navbar.login")}
              </p>
              <p
                className="self-center cursor-pointer hover:text-custom-light-yellow"
                onClick={() => navigate("/signup")}
              >
                {t("navbar.signup")}
              </p>
            </>
          ) : (
            <Menu>
              <MenuHandler>
                <div className="flex items-center gap-2 cursor-pointer">
                  {user?.profileImageUrl ? (
                    <Avatar
                      variant="circular"
                      alt={user?.firstName || t("navbar.user")}
                      className="cursor-pointer h-[40px] w-[40px]"
                      src={user.profileImageUrl}
                    />
                  ) : (
                    <div className="h-[40px] w-[40px] rounded-full bg-gray-200 flex items-center justify-center">
                      <CiUser className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user?.firstName ||
                      user?.email?.split("@")[0] ||
                      t("navbar.user")}
                  </span>
                </div>
              </MenuHandler>
              <MenuList>
                <div className="flex outline-0 cursor-pointer">
                  <hr className="my-2 border-blue-gray-50 w-1/3" />
                  <p className=" w-1/3 text-center text-custom">
                    {t("navbar.account")}
                  </p>
                  <hr className="my-2  w-1/3 border-blue-gray-50" />
                </div>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/profile")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.profile")}
                  </Typography>
                </MenuItem>
                <div className="flex outline-0 cursor-pointer">
                  <hr className="my-2 border-blue-gray-50 w-1/3" />
                  <p className=" w-1/3 text-center">{t("navbar.credits")}</p>
                  <hr className="my-2  w-1/3 border-blue-gray-50" />
                </div>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/billing")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.buyMore")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/transactions")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.histories")}
                  </Typography>
                </MenuItem>
                <div className="flex outline-0 cursor-pointer">
                  <hr className="my-2 border-blue-gray-50 w-1/3" />
                  <p className=" w-1/3 text-center">{t("navbar.support")}</p>
                  <hr className="my-2  w-1/3 border-blue-gray-50" />
                </div>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/help")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.faq")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/contact")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.contactSupport")}
                  </Typography>
                </MenuItem>
                <div className="flex outline-0 cursor-pointer">
                  <hr className="my-2 border-blue-gray-50 w-full" />
                </div>
                <MenuItem className="flex gap-2" onClick={handleLogout}>
                  <Typography variant="small" className="font-normal">
                    {t("navbar.logout")}
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default PTAINavBar;
