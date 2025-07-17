import { useTranslation } from 'react-i18next';

/**
 * Enhanced useTranslation hook with validation in development
 * For now, this is a simple wrapper around useTranslation
 * In the future, we can add translation key validation here
 * 
 * @param {string} ns - Namespace (optional)
 * @returns {Object} Translation object
 */
export const useValidatedTranslation = (ns) => {
  const translationObject = useTranslation(ns);
  
  // For now, just return the original translation object
  // In development, we could add validation logic here
  return translationObject;
};

export default useValidatedTranslation;
