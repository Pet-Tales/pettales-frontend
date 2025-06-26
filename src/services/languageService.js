import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

const API_URL = `${API_BASE_URL}/api/users`;

/**
 * Update user's language preference
 * @param {string} language - Language code (en, es)
 * @returns {Promise} API response
 */
export const updateLanguagePreference = async (language) => {
  try {
    const response = await axios.put(`${API_URL}/language-preference`, {
      language,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get user profile information
 * @returns {Promise} API response
 */
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const LanguageService = {
  updateLanguagePreference,
  getUserProfile,
};

export default LanguageService;
