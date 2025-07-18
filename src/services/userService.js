import http from "@/utils/http";

/**
 * Get user profile information
 * @returns {Promise} API response
 */
export const getUserProfile = async () => {
  try {
    const response = await http.get("/api/user/profile");
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
    const response = await http.put("/api/user/profile", profileData);
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
    const response = await http.get(
      `/api/user/verify-email-change?token=${token}`
    );
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
    const response = await http.put("/api/user/language-preference", {
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
    const response = await http.post("/api/user/request-password-change");
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
