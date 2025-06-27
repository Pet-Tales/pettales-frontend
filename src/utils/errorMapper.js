import { useTranslation } from "react-i18next";

/**
 * Error message mapping system for translating backend errors to localized frontend messages
 */

// Common backend error messages and their translation keys
const ERROR_MESSAGE_MAP = {
  // Authentication errors
  "Invalid email or password": "errors.invalidCredentials",
  "Invalid credentials": "errors.invalidCredentials",
  "User not found": "errors.userNotFound",
  "Email not verified": "errors.emailNotVerified",
  "Account suspended": "errors.accountSuspended",
  "Account deleted": "errors.accountDeleted",

  // Registration errors
  "Email already exists": "errors.emailAlreadyExists",
  "Email already registered": "errors.emailAlreadyExists",
  "User already exists": "errors.emailAlreadyExists",
  "Invalid email format": "errors.invalidEmailFormat",
  "Password too short": "errors.passwordTooShort",
  "Password must be at least 6 characters": "errors.passwordTooShort",
  "Passwords do not match": "errors.passwordsDoNotMatch",

  // Validation errors
  "Email is required": "errors.emailRequired",
  "Password is required": "errors.passwordRequired",
  "First name is required": "errors.firstNameRequired",
  "Last name is required": "errors.lastNameRequired",
  "Invalid email address": "errors.invalidEmailFormat",
  "Email address is invalid": "errors.invalidEmailFormat",

  // Token/Session errors
  "Invalid token": "errors.invalidToken",
  "Token expired": "errors.tokenExpired",
  "Session expired": "errors.sessionExpired",
  "Authentication required": "errors.authenticationRequired",
  "Access denied": "errors.accessDenied",
  Unauthorized: "errors.unauthorized",

  // Email verification errors
  "Verification token not found": "errors.verificationTokenNotFound",
  "Email verification failed": "errors.emailVerificationFailed",
  "Email already verified": "errors.emailAlreadyVerified",

  // Server errors
  "Internal server error": "errors.internalServerError",
  "Server error": "errors.serverError",
  "Service unavailable": "errors.serviceUnavailable",
  "Network error": "errors.networkError",
  "Request timeout": "errors.requestTimeout",

  // Rate limiting
  "Too many requests": "errors.tooManyRequests",
  "Rate limit exceeded": "errors.rateLimitExceeded",

  // Language preference errors
  "Invalid language": "errors.invalidLanguage",
  "Language not supported": "errors.languageNotSupported",

  // Character errors
  "Character name must be at least 2 characters long":
    "characters.errors.nameMinLength",
  "Character name is required": "characters.errors.nameRequired",
  "Age is required for human characters": "characters.errors.ageRequired",
  "Age must be a positive number": "characters.errors.ageInvalid",
  "Gender is required for human characters": "characters.errors.genderRequired",
  "Character not found": "characters.characterNotFound",
  "Character is used in books and cannot be deleted":
    "characters.characterUsedInBooks",
  "Failed to create character": "errors.genericError",
  "Failed to update character": "errors.genericError",
  "Failed to delete character": "errors.genericError",
  "Failed to upload character image": "errors.genericError",
  "Invalid file type. Only JPG and PNG files are allowed.":
    "profile.invalidFileType",
  "File size too large. Maximum size is 5MB.": "profile.fileTooLarge",
  "Reference images are only allowed for pet characters":
    "characters.errors.imageOnlyForPets",

  // Generic errors
  "Bad request": "errors.badRequest",
  "Not found": "errors.notFound",
  Forbidden: "errors.forbidden",
  Conflict: "errors.conflict",
};

// Error codes mapping (for when backend sends error codes)
const ERROR_CODE_MAP = {
  AUTH_001: "errors.invalidCredentials",
  AUTH_002: "errors.userNotFound",
  AUTH_003: "errors.emailNotVerified",
  AUTH_004: "errors.accountSuspended",
  AUTH_005: "errors.sessionExpired",
  AUTH_006: "errors.authenticationRequired",
  AUTH_010: "errors.invalidResetToken",
  AUTH_011: "errors.tooManyResetRequests",

  REG_001: "errors.emailAlreadyExists",
  REG_002: "errors.invalidEmailFormat",
  REG_003: "errors.passwordTooShort",
  REG_004: "errors.passwordsDoNotMatch",
  REG_005: "errors.emailExistsUnverified",

  VAL_001: "errors.emailRequired",
  VAL_002: "errors.passwordRequired",
  VAL_003: "errors.invalidEmailFormat",

  TOKEN_001: "errors.invalidToken",
  TOKEN_002: "errors.tokenExpired",
  TOKEN_003: "errors.verificationTokenNotFound",

  SERVER_001: "errors.internalServerError",
  SERVER_002: "errors.serviceUnavailable",
  SERVER_003: "errors.networkError",

  RATE_001: "errors.tooManyRequests",
  LANG_001: "errors.invalidLanguage",
};

/**
 * Map backend error message to translation key
 * @param {string} errorMessage - Error message from backend
 * @param {string} errorCode - Optional error code from backend
 * @returns {string} Translation key
 */
export const mapErrorToTranslationKey = (errorMessage, errorCode = null) => {
  // First try to map by error code if provided
  if (errorCode && ERROR_CODE_MAP[errorCode]) {
    return ERROR_CODE_MAP[errorCode];
  }

  // Then try to map by exact message match
  if (errorMessage && ERROR_MESSAGE_MAP[errorMessage]) {
    return ERROR_MESSAGE_MAP[errorMessage];
  }

  // Try partial matches for common patterns
  const lowerMessage = errorMessage?.toLowerCase() || "";

  if (lowerMessage.includes("email") && lowerMessage.includes("already")) {
    return "errors.emailAlreadyExists";
  }
  if (lowerMessage.includes("password") && lowerMessage.includes("short")) {
    return "errors.passwordTooShort";
  }
  if (lowerMessage.includes("invalid") && lowerMessage.includes("email")) {
    return "errors.invalidEmailFormat";
  }
  if (lowerMessage.includes("invalid") && lowerMessage.includes("password")) {
    return "errors.invalidCredentials";
  }
  if (lowerMessage.includes("token") && lowerMessage.includes("expired")) {
    return "errors.tokenExpired";
  }
  if (lowerMessage.includes("session") && lowerMessage.includes("expired")) {
    return "errors.sessionExpired";
  }
  if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
    return "errors.networkError";
  }
  if (lowerMessage.includes("server") || lowerMessage.includes("internal")) {
    return "errors.serverError";
  }

  // Default fallback
  return "errors.genericError";
};

/**
 * Translate backend error to localized message
 * @param {string} errorMessage - Error message from backend
 * @param {string} errorCode - Optional error code from backend
 * @param {Function} t - Translation function
 * @returns {string} Localized error message
 */
export const translateError = (errorMessage, errorCode, t) => {
  const translationKey = mapErrorToTranslationKey(errorMessage, errorCode);
  const translatedMessage = t(translationKey);

  // If translation key doesn't exist, fall back to original message
  if (translatedMessage === translationKey) {
    return errorMessage || t("errors.genericError");
  }

  return translatedMessage;
};

/**
 * React hook for error translation
 * @returns {Function} Error translation function
 */
export const useErrorTranslation = () => {
  const { t } = useTranslation();

  return (errorMessage, errorCode = null) => {
    return translateError(errorMessage, errorCode, t);
  };
};

/**
 * Process API error response and return localized message
 * @param {Object} error - Error object from API response
 * @param {Function} t - Translation function
 * @returns {string} Localized error message
 */
export const processApiError = (error, t) => {
  // Handle different error response formats
  let errorMessage = "";
  let errorCode = null;

  if (error?.response?.data) {
    const data = error.response.data;
    errorMessage = data.message || data.error || "";
    errorCode = data.code || data.errorCode || null;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Handle network errors
  if (
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("Network Error")
  ) {
    return t("errors.networkError");
  }

  // Handle timeout errors
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return t("errors.requestTimeout");
  }

  return translateError(errorMessage, errorCode, t);
};

/**
 * Enhanced error handler for Redux actions
 * @param {Object} error - Error object
 * @param {Function} t - Translation function
 * @returns {string} Localized error message
 */
export const handleReduxError = (error, t) => {
  if (error?.payload) {
    return processApiError(error.payload, t);
  }
  return processApiError(error, t);
};

export default {
  mapErrorToTranslationKey,
  translateError,
  useErrorTranslation,
  processApiError,
  handleReduxError,
};
