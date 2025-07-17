import i18n from "@/i18n";
import LanguageService from "@/services/languageService";
import logger from "@/utils/logger";

// Track if language was manually changed in current session
let isLanguageManuallyChanged = false;

/**
 * Mark language as manually changed
 */
export const markLanguageAsManuallyChanged = () => {
  isLanguageManuallyChanged = true;
  logger.info("Language marked as manually changed");
};

/**
 * Check if language was manually changed in current session
 * @returns {boolean}
 */
export const isLanguageManuallyChangedInSession = () => {
  return isLanguageManuallyChanged;
};

/**
 * Reset manual language change flag
 */
export const resetLanguageManualFlag = () => {
  isLanguageManuallyChanged = false;
  logger.info("Language manual change flag reset");
};

/**
 * Change language and sync with user preferences if authenticated
 * @param {string} language - Language code (en, es)
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} updateUserInStore - Function to update user in Redux store
 * @param {boolean} isManualChange - Whether this is a manual user change (default: true)
 * @returns {Promise<boolean>} Success status
 */
export const changeLanguage = async (
  language,
  isAuthenticated = false,
  updateUserInStore = null,
  isManualChange = true
) => {
  try {
    // Change language in i18n
    await i18n.changeLanguage(language);

    // Mark as manually changed if this is a user-initiated change
    if (isManualChange) {
      markLanguageAsManuallyChanged();
    }

    // If user is authenticated, save preference to backend
    if (isAuthenticated) {
      try {
        const response = await LanguageService.updateLanguagePreference(
          language
        );

        // Update user in Redux store if function provided
        if (updateUserInStore && response.success) {
          updateUserInStore(response.data.user);
        }

        logger.info(
          `Language preference updated to ${language} for authenticated user`
        );
      } catch (error) {
        logger.error("Failed to update language preference on server:", error);
        // Don't fail the language change if API call fails
      }
    } else {
      logger.info(`Language changed to ${language} for guest user`);
    }

    return true;
  } catch (error) {
    logger.error("Failed to change language:", error);
    return false;
  }
};

/**
 * Detect browser language
 * @returns {string|null} Browser language code or null if not detectable
 */
export const detectBrowserLanguage = () => {
  try {
    // Try different browser language detection methods
    const browserLang =
      navigator.language ||
      navigator.languages?.[0] ||
      navigator.userLanguage ||
      navigator.browserLanguage;

    if (browserLang) {
      // Extract language code (e.g., "en-US" -> "en", "es-ES" -> "es")
      const langCode = browserLang.split("-")[0].toLowerCase();
      logger.info(`Detected browser language: ${browserLang} -> ${langCode}`);
      return langCode;
    }

    logger.info("Could not detect browser language");
    return null;
  } catch (error) {
    logger.error("Error detecting browser language:", error);
    return null;
  }
};

/**
 * Validate if language is supported, fallback to English if not
 * @param {string} language - Language code to validate
 * @returns {string} Valid language code
 */
export const validateLanguage = (language) => {
  if (!language || !isSupportedLanguage(language)) {
    logger.info(
      `Language "${language}" not supported, falling back to English`
    );
    return "en";
  }
  return language;
};

/**
 * Get effective language from localStorage with validation and browser detection
 * Priority: localStorage → browser language → English
 * @returns {string} Valid language code from localStorage, browser, or fallback
 */
export const getEffectiveLanguage = () => {
  const storedLanguage = localStorage.getItem("i18nextLng");

  // If localStorage has a value, validate and use it
  if (storedLanguage) {
    const validatedStored = validateLanguage(storedLanguage);
    logger.info(
      `Using localStorage language: ${storedLanguage} -> ${validatedStored}`
    );
    return validatedStored;
  }

  // If no localStorage, try to detect browser language
  const browserLanguage = detectBrowserLanguage();
  if (browserLanguage && isSupportedLanguage(browserLanguage)) {
    logger.info(`Using browser language: ${browserLanguage}`);
    // Save detected browser language to localStorage for future use
    localStorage.setItem("i18nextLng", browserLanguage);
    return browserLanguage;
  }

  // Final fallback to English
  logger.info(
    "No localStorage or unsupported browser language, falling back to English"
  );
  localStorage.setItem("i18nextLng", "en");
  return "en";
};

/**
 * Sync language preferences between localStorage and database
 * Priority: localStorage > database (localStorage always wins)
 * @param {Object} user - User object with preferredLanguage
 * @param {Function} updateUserInStore - Function to update user in Redux store
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {Promise<void>}
 */
export const syncLanguagePreferences = async (
  user,
  updateUserInStore = null,
  isAuthenticated = false
) => {
  const currentLanguage = i18n.language;
  const userPreferredLanguage = user?.preferredLanguage;
  const effectiveLanguage = getEffectiveLanguage();

  logger.info(
    `Language sync - Current: ${currentLanguage}, Database: ${userPreferredLanguage}, localStorage: ${effectiveLanguage}`
  );

  // Step 1: Ensure current language matches localStorage (with validation)
  if (currentLanguage !== effectiveLanguage) {
    try {
      await i18n.changeLanguage(effectiveLanguage);
      logger.info(
        `Applied localStorage language: ${effectiveLanguage} (was: ${currentLanguage})`
      );
    } catch (error) {
      logger.error("Failed to apply localStorage language:", error);
    }
  }

  // Step 2: If user is authenticated and database differs from localStorage, update database
  if (
    isAuthenticated &&
    userPreferredLanguage &&
    userPreferredLanguage !== effectiveLanguage
  ) {
    try {
      logger.info(
        `Database (${userPreferredLanguage}) differs from localStorage (${effectiveLanguage}). Updating database.`
      );

      const response = await LanguageService.updateLanguagePreference(
        effectiveLanguage
      );

      // Update user in Redux store if function provided
      if (updateUserInStore && response.success) {
        updateUserInStore(response.data.user);
      }

      logger.info(
        `Updated database preference to match localStorage: ${effectiveLanguage}`
      );
    } catch (error) {
      logger.error("Failed to update database language preference:", error);
      // Continue with localStorage language even if database sync fails
    }
  }

  // Step 3: If user has no database preference but localStorage has non-default, save to database
  if (isAuthenticated && !userPreferredLanguage && effectiveLanguage !== "en") {
    try {
      logger.info(
        `No database preference found, saving localStorage language (${effectiveLanguage}) to database`
      );

      const response = await LanguageService.updateLanguagePreference(
        effectiveLanguage
      );

      // Update user in Redux store if function provided
      if (updateUserInStore && response.success) {
        updateUserInStore(response.data.user);
      }

      logger.info(
        `Saved localStorage language ${effectiveLanguage} to database`
      );
    } catch (error) {
      logger.error("Failed to save localStorage language to database:", error);
      // Continue with localStorage language even if database sync fails
    }
  }
};

/**
 * Initialize language system on app startup
 * Validates localStorage and ensures proper fallback
 * @returns {Promise<void>}
 */
export const initializeLanguageSystem = async () => {
  const effectiveLanguage = getEffectiveLanguage();
  const currentLanguage = i18n.language;

  // If current language doesn't match effective language, apply the effective one
  if (currentLanguage !== effectiveLanguage) {
    try {
      await i18n.changeLanguage(effectiveLanguage);
      logger.info(`Language system initialized with: ${effectiveLanguage}`);
    } catch (error) {
      logger.error("Failed to initialize language system:", error);
      // Fallback to English if initialization fails
      try {
        await i18n.changeLanguage("en");
        localStorage.setItem("i18nextLng", "en");
      } catch (fallbackError) {
        logger.error("Failed to fallback to English:", fallbackError);
      }
    }
  }

  // Ensure localStorage is updated with the validated language
  if (localStorage.getItem("i18nextLng") !== effectiveLanguage) {
    localStorage.setItem("i18nextLng", effectiveLanguage);
  }
};

/**
 * Get current language from i18n
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18n.language || "en";
};

/**
 * Check if language is supported
 * @param {string} language - Language code to check
 * @returns {boolean} Whether language is supported
 */
export const isSupportedLanguage = (language) => {
  return ["en", "es"].includes(language);
};

const LanguageUtils = {
  changeLanguage,
  syncLanguagePreferences,
  detectBrowserLanguage,
  validateLanguage,
  getEffectiveLanguage,
  initializeLanguageSystem,
  getCurrentLanguage,
  isSupportedLanguage,
  // Keep old name for backward compatibility during transition
  initializeUserLanguage: syncLanguagePreferences,
};

export default LanguageUtils;
