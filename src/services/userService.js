import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

const API_URL = `${API_BASE_URL}/api/user`;

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

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.firstName - First name
 * @param {string} profileData.lastName - Last name
 * @param {string} profileData.email - Email address
 * @returns {Promise} API response
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify email change with token
 * @param {string} token - Email change verification token
 * @returns {Promise} API response
 */
export const verifyEmailChange = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/verify-email-change?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

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
 * Request password change (sends reset email)
 * @returns {Promise} API response
 */
export const requestPasswordChange = async () => {
  try {
    const response = await axios.post(`${API_URL}/request-password-change`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const UserService = {
  getUserProfile,
  updateProfile,
  verifyEmailChange,
  updateLanguagePreference,
  requestPasswordChange,
};

export default UserService;
