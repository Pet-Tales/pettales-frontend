import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/books";

/**
 * Get user's books with pagination
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of books per page
 * @param {string} status - Filter by book status ('pending', 'generating', 'completed', 'failed', or null for all)
 * @returns {Promise} - Promise resolving to books data
 */
const getUserBooks = (page = 1, limit = 12, status = null) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
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
 * Get a specific book by ID
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to book data
 */
const getBookById = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}`;

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
 * Create a new book
 * @param {Object} bookData - Book data
 * @returns {Promise} - Promise resolving to created book data
 */
const createBook = (bookData) => {
  return new Promise((resolve, reject) => {
    http
      .post(_API, bookData)
      .then((response) => {
        if (response.status === 201) {
          logger.api("POST", _API, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("POST", _API, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "POST",
          _API,
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
 * Update a book
 * @param {string} bookId - Book's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Promise resolving to updated book data
 */
const updateBook = (bookId, updateData) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}`;

    http
      .put(url, updateData)
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
 * Toggle book public/private status
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to updated book data
 */
const toggleBookPublic = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}/toggle-public`;

    http
      .patch(url)
      .then((response) => {
        if (response.status === 200) {
          logger.api("PATCH", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("PATCH", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "PATCH",
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
 * Delete a book
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to deletion confirmation
 */
const deleteBook = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}`;

    http
      .delete(url)
      .then((response) => {
        if (response.status === 200) {
          logger.api("DELETE", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("DELETE", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "DELETE",
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
 * Retry failed book generation
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to updated book data
 */
const retryBookGeneration = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}/retry`;

    http
      .post(url)
      .then((response) => {
        if (response.status === 200) {
          logger.api("POST", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("POST", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "POST",
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
 * Get book pages
 * @param {string} bookId - Book's ID
 * @param {boolean} grouped - Whether to group pages by story page number
 * @returns {Promise} - Promise resolving to pages data
 */
const getBookPages = (bookId, grouped = false) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    if (grouped) {
      params.append("grouped", "true");
    }

    const url = `/api/pages/book/${bookId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

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
 * Update a page
 * @param {string} pageId - Page's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Promise resolving to updated page data
 */
const updatePage = (pageId, updateData) => {
  return new Promise((resolve, reject) => {
    const url = `/api/pages/${pageId}`;

    http
      .put(url, updateData)
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
 * Update book cover selection
 * @param {string} bookId - Book's ID
 * @param {Object} coverData - Cover update data (front_cover_image_url or back_cover_image_url)
 * @returns {Promise} - Promise resolving to updated book data
 */
const updateBookCover = (bookId, coverData) => {
  return updateBook(bookId, coverData);
};

/**
 * Regenerate PDF for a book
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to new PDF URL
 */
const regeneratePDF = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}/regenerate-pdf`;

    http
      .post(url)
      .then((response) => {
        if (response.status === 200) {
          logger.api("POST", url, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("POST", url, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "POST",
          url,
          error.response?.status || 0,
          0,
          error.response?.data
        );
        reject({
          status: error.response?.status || 0,
          data: error.response?.data,
        });
      });
  });
};

/**
 * Check if book content has changed (for PDF regeneration button state)
 * @param {string} bookId - Book's ID
 * @returns {Promise} - Promise resolving to change status
 */
const checkPDFStatus = (bookId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${bookId}/pdf-status`;

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
        reject({
          status: error.response?.status || 0,
          data: error.response?.data,
        });
      });
  });
};

const BookService = {
  getUserBooks,
  getBookById,
  createBook,
  updateBook,
  updateBookCover,
  toggleBookPublic,
  deleteBook,
  retryBookGeneration,
  getBookPages,
  updatePage,
  regeneratePDF,
  checkPDFStatus,
};

export default BookService;
