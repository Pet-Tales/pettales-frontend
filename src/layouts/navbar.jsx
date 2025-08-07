import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { CiUser } from "react-icons/ci";
import { FaCoins, FaBars, FaTimes } from "react-icons/fa";
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
    labelKey: "navbar.myOrders",
    path: "/my-orders",
    isAuthRequired: true,
    subRoute: ["/my-orders"],
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavigation = (item) => {
    setIsMobileMenuOpen(false);
    if (item.labelKey === "navbar.howItWork") {
      if (location.pathname === "/") {
        // If already on home page, scroll to How it Works section
        const howItWorksSection = document.getElementById(
          "how-it-works-section"
        );
        if (howItWorksSection) {
          howItWorksSection.scrollIntoView({
            behavior: "smooth",
          });
        }
      } else {
        // If on different page, navigate to home with How it Works hash
        navigate("/#how-it-works");
      }
    } else {
      navigate(item.path);
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
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo-text-1.png"
            className="cursor-pointer h-8 w-auto tablet:h-10 laptop:w-[220px]"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden laptop:flex gap-6">
          {filteredMenuItems.map((item) => {
            return (
              <Menu key={item.path} allowHover>
                <span
                  className={`cursor-pointer self-center ${
                    item.subRoute.includes(currentUrl)
                      ? "text-custom-light-yellow"
                      : "text-custom-black"
                  }`}
                  onClick={() => {
                    if (item.labelKey === "navbar.howItWork") {
                      if (location.pathname === "/") {
                        // If already on home page, scroll to How it Works section
                        const howItWorksSection = document.getElementById(
                          "how-it-works-section"
                        );
                        if (howItWorksSection) {
                          howItWorksSection.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      } else {
                        // If on different page, navigate to home with How it Works hash
                        navigate("/#how-it-works");
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  {t(item.labelKey)}
                </span>
              </Menu>
            );
          })}
        </div>

        {/* Desktop Right Side Elements */}
        <div className="hidden laptop:flex gap-4 items-center">
          {/* Credit Balance Display */}
          {isAuthenticated && user && (
            <div
              className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer"
              onClick={() => navigate("/credits/history")}
            >
              <FaCoins className="text-yellow-800 h-4 w-4" />
              <span className="font-medium text-base">
                {user?.creditsBalance?.toLocaleString() || 0}
              </span>
            </div>
          )}

          {/* Language Dropdown */}
          <Menu>
            <MenuHandler>
              <div className="flex items-center gap-1 cursor-pointer hover:text-custom-light-yellow">
                <span className="text-sm">{getCurrentLanguage().flag}</span>
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
                  <span className="text-sm">{language.flag}</span>
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
                <div className="px-4 py-2 text-center">
                  <Typography variant="small" className="text-gray-600">
                    {t("navbar.balance")}:{" "}
                    {user?.creditsBalance?.toLocaleString() || 0}
                  </Typography>
                </div>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/pricing")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.buyMore")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => navigate("/credits/history")}
                >
                  <Typography variant="small" className="font-normal">
                    {t("credits.historyTitle")}
                  </Typography>
                </MenuItem>
                <div className="flex outline-0 cursor-pointer">
                  <hr className="my-2 border-blue-gray-50 w-1/3" />
                  <p className=" w-1/3 text-center">{t("navbar.support")}</p>
                  <hr className="my-2  w-1/3 border-blue-gray-50" />
                </div>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => {
                    if (location.pathname === "/") {
                      // If already on home page, scroll to FAQ section
                      const faqSection = document.getElementById("faq-section");
                      if (faqSection) {
                        faqSection.scrollIntoView({ behavior: "smooth" });
                      }
                    } else {
                      // If on different page, navigate to home with FAQ hash
                      navigate("/#faq");
                    }
                  }}
                >
                  <Typography variant="small" className="font-normal">
                    {t("navbar.faq")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  className="flex gap-2"
                  onClick={() => {
                    if (location.pathname === "/") {
                      // If already on home page, scroll to Contact section
                      const contactSection =
                        document.getElementById("contact-section");
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: "smooth" });
                      }
                    } else {
                      // If on different page, navigate to home with Contact hash
                      navigate("/#contact");
                    }
                  }}
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

        {/* Mobile Menu Button */}
        <div className="laptop:hidden flex items-center gap-2">
          {/* Mobile Credit Balance (for authenticated users) */}
          {isAuthenticated && user && (
            <div
              className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer"
              onClick={() => navigate("/credits/history")}
            >
              <FaCoins className="text-yellow-800 h-4 w-4" />
              <span className="font-medium text-base">
                {user?.creditsBalance?.toLocaleString() || 0}
              </span>
            </div>
          )}

          <button
            className="text-custom-black hover:text-custom-light-yellow p-2"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="laptop:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Navigation Items */}
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  item.subRoute.includes(currentUrl)
                    ? "text-custom-light-yellow bg-gray-50"
                    : "text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                }`}
                onClick={() => handleMobileNavigation(item)}
              >
                {t(item.labelKey)}
              </button>
            ))}

            {/* Mobile Language Selector */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-3 py-2">
                <Typography
                  variant="small"
                  className="font-medium text-gray-500 uppercase tracking-wide"
                >
                  {t("navbar.language")}
                </Typography>
                <div className="mt-1 space-y-1">
                  {getLanguages(t).map((language) => (
                    <button
                      key={language.code}
                      className={`flex items-center gap-2 w-full px-2 py-1 rounded text-sm ${
                        language.code === i18n.language
                          ? "text-custom-light-yellow bg-gray-50"
                          : "text-gray-700 hover:text-custom-light-yellow hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        handleLanguageChange(language.code);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Authentication */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {!isAuthenticated ? (
                <div className="space-y-1">
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.login")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.signup")}
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-2 px-3 py-2">
                    {user?.profileImageUrl ? (
                      <Avatar
                        variant="circular"
                        alt={user?.firstName || t("navbar.user")}
                        className="h-8 w-8"
                        src={user.profileImageUrl}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <CiUser className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {user?.firstName ||
                        user?.email?.split("@")[0] ||
                        t("navbar.user")}
                    </span>
                  </div>

                  {/* Mobile User Menu Items */}
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.profile")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      navigate("/pricing");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.buyMore")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      navigate("/credits/history");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.histories")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      if (location.pathname === "/") {
                        const faqSection =
                          document.getElementById("faq-section");
                        if (faqSection) {
                          faqSection.scrollIntoView({ behavior: "smooth" });
                        }
                      } else {
                        navigate("/#faq");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.faq")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-custom-black hover:text-custom-light-yellow hover:bg-gray-50"
                    onClick={() => {
                      if (location.pathname === "/") {
                        const contactSection =
                          document.getElementById("contact-section");
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: "smooth" });
                        }
                      } else {
                        navigate("/#contact");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.contactSupport")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default PTAINavBar;
