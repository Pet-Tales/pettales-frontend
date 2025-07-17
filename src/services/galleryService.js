import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/gallery";

/**
 * Get public books for gallery
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of books per page
 * @param {string} search - Search query
 * @returns {Promise} - Promise resolving to public books data
 */
const getPublicBooks = (page = 1, limit = 12, search = "") => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const url = `${_API}?${params.toString()}`;

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

/**
 * Get featured public books
 * @param {number} limit - Number of books to return
 * @returns {Promise} - Promise resolving to featured books data
 */
const getFeaturedBooks = (limit = 6) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const url = `${_API}/featured?${params.toString()}`;

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

/**
 * Get book template data for creating a new book
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to template data
 */
const getBookTemplate = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/template/${bookId}`;

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

/**
 * Get gallery statistics
 * @returns {Promise} - Promise resolving to gallery stats
 */
const getGalleryStats = () => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/stats`;

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

/**
 * Get public books by language
 * @param {string} language - Language code
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of books per page
 * @returns {Promise} - Promise resolving to books data
 */
const getPublicBooksByLanguage = (language, page = 1, limit = 12) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${_API}/language/${language}?${params.toString()}`;

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

const GalleryService = {
  getPublicBooks,
  getFeaturedBooks,
  getBookTemplate,
  getGalleryStats,
  getPublicBooksByLanguage,
};

export default GalleryService;
