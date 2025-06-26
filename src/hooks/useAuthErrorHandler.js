import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useErrorTranslation } from '@/utils/errorMapper';

/**
 * Custom hook for handling authentication errors with localized messages
 */
export const useAuthErrorHandler = () => {
  const translateError = useErrorTranslation();

  /**
   * Handle and display authentication errors
   * @param {Object} error - Error object from API or Redux action
   * @param {Object} options - Options for error handling
   * @param {boolean} options.showToast - Whether to show toast notification (default: true)
   * @param {string} options.fallbackMessage - Fallback message if translation fails
   * @returns {string} Localized error message
   */
  const handleAuthError = useCallback((error, options = {}) => {
    const { showToast = true, fallbackMessage } = options;
    
    // Extract error information
    let errorMessage = '';
    let errorCode = null;
    
    // Handle different error formats
    if (error?.response?.data) {
      const data = error.response.data;
      errorMessage = data.message || data.error || '';
      errorCode = data.code || data.errorCode || null;
    } else if (error?.payload?.response?.data) {
      // Redux rejected action format
      const data = error.payload.response.data;
      errorMessage = data.message || data.error || '';
      errorCode = data.code || data.errorCode || null;
    } else if (error?.payload?.message) {
      errorMessage = error.payload.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Translate the error
    const translatedMessage = translateError(errorMessage, errorCode);
    const finalMessage = translatedMessage || fallbackMessage || 'An error occurred';
    
    // Show toast notification if requested
    if (showToast) {
      toast.error(finalMessage);
    }
    
    return finalMessage;
  }, [translateError]);

  /**
   * Handle login errors specifically
   * @param {Object} error - Login error
   * @returns {string} Localized error message
   */
  const handleLoginError = useCallback((error) => {
    return handleAuthError(error, {
      fallbackMessage: 'Login failed. Please try again.',
    });
  }, [handleAuthError]);

  /**
   * Handle registration errors specifically
   * @param {Object} error - Registration error
   * @returns {string} Localized error message
   */
  const handleRegistrationError = useCallback((error) => {
    return handleAuthError(error, {
      fallbackMessage: 'Registration failed. Please try again.',
    });
  }, [handleAuthError]);

  /**
   * Handle email verification errors specifically
   * @param {Object} error - Email verification error
   * @returns {string} Localized error message
   */
  const handleVerificationError = useCallback((error) => {
    return handleAuthError(error, {
      fallbackMessage: 'Email verification failed. Please try again.',
    });
  }, [handleAuthError]);

  /**
   * Handle session/authentication errors specifically
   * @param {Object} error - Session error
   * @returns {string} Localized error message
   */
  const handleSessionError = useCallback((error) => {
    return handleAuthError(error, {
      fallbackMessage: 'Session error. Please log in again.',
    });
  }, [handleAuthError]);

  return {
    handleAuthError,
    handleLoginError,
    handleRegistrationError,
    handleVerificationError,
    handleSessionError,
    translateError,
  };
};

export default useAuthErrorHandler;
