import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/user";

/**
 * Update user's language preference
 * @param {string} language - Language code (en, es)
 * @returns {Promise} API response
 */
export const updateLanguagePreference = async (language) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/language-preference`;

    http
      .put(url, { language })
      .then((response) => {
        if (response.status === 200) {
          logger.api("PUT", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("PUT", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "PUT",
          url,
          error.response?.status || 0,
          0,
          error.response?.data
        );
        if (!DEBUG_MODE) logger.clear();
        reject(error.response);
      });
  });
};

/**
 * Get user profile information
 * @returns {Promise} API response
 */
export const getUserProfile = async () => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/profile`;

    http
      .get(url)
      .then((response) => {
        if (response.status === 200) {
          logger.api("GET", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("GET", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "GET",
          url,
          error.response?.status || 0,
          0,
          error.response?.data
        );
        if (!DEBUG_MODE) logger.clear();
        reject(error.response);
      });
  });
};

const LanguageService = {
  updateLanguagePreference,
  getUserProfile,
};

export default LanguageService;
