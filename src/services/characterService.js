import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/characters";

/**
 * Get user's characters with pagination
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of characters per page
 * @param {string} type - Filter by character type ('human', 'pet', or null for all)
 * @returns {Promise} - Promise resolving to characters data
 */
const getCharacters = (page = 1, limit = 12, type = null) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) {
      params.append("type", type);
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
 * Get a specific character by ID
 * @param {string} characterId - Character's ID
 * @returns {Promise} - Promise resolving to character data
 */
const getCharacterById = (characterId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${characterId}`;

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
 * Create a new character
 * @param {Object} characterData - Character data
 * @returns {Promise} - Promise resolving to created character data
 */
const createCharacter = (characterData) => {
  return new Promise((resolve, reject) => {
    http
      .post(_API, characterData)
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
 * Update a character
 * @param {string} characterId - Character's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Promise resolving to updated character data
 */
const updateCharacter = (characterId, updateData) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${characterId}`;

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
 * Delete a character
 * @param {string} characterId - Character's ID
 * @param {boolean} force - Whether to force delete even if used in books
 * @returns {Promise} - Promise resolving to deletion result
 */
const deleteCharacter = (characterId, force = false) => {
  return new Promise((resolve, reject) => {
    const url = force
      ? `${_API}/${characterId}/force`
      : `${_API}/${characterId}`;

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
 * Generate presigned URL for character reference image upload
 * @param {string} characterId - Character's ID
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise} - Promise resolving to upload URL data
 */
const generateImageUploadUrl = (characterId, contentType) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${characterId}/image/upload-url`;

    http
      .post(url, { contentType })
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
 * Upload file to S3 using presigned URL (reuse from avatar service)
 * @param {string} uploadUrl - The presigned URL for upload
 * @param {File} file - The file to upload
 * @param {string} contentType - The MIME type of the file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - Promise resolving when upload is complete
 */
const uploadToS3 = (uploadUrl, file, contentType, onProgress = null) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress && typeof onProgress === "function") {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        logger.info("Character image uploaded successfully to S3");
        resolve({
          status: xhr.status,
          message: "Upload successful",
        });
      } else {
        logger.error(`S3 upload failed with status: ${xhr.status}`);
        reject({
          status: xhr.status,
          message: "Upload failed",
        });
      }
    });

    xhr.addEventListener("error", () => {
      logger.error("S3 upload error");
      reject({
        status: 0,
        message: "Upload error",
      });
    });

    xhr.addEventListener("abort", () => {
      logger.warn("S3 upload aborted");
      reject({
        status: 0,
        message: "Upload aborted",
      });
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("ACL", "public-read");
    xhr.send(file);
  });
};

/**
 * Update character's reference image URL in the database
 * @param {string} characterId - Character's ID
 * @param {string} imageUrl - The CloudFront URL of the uploaded image
 * @returns {Promise} - Promise resolving to updated character data
 */
const updateCharacterImage = (characterId, imageUrl) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${characterId}/image`;

    http
      .put(url, { imageUrl })
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
 * Delete character's reference image
 * @param {string} characterId - Character's ID
 * @returns {Promise} - Promise resolving to deletion result
 */
const deleteCharacterImage = (characterId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/${characterId}/image`;

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
 * Validate file for character image upload (same as avatar)
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!file) {
    return {
      isValid: false,
      error: "No file selected",
    };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPG and PNG files are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 5MB.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Complete character image upload process
 * @param {string} characterId - Character's ID
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - Promise resolving to updated character data
 */
const uploadCharacterImage = async (characterId, file, onProgress = null) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Step 1: Generate presigned URL
    const uploadUrlResponse = await generateImageUploadUrl(
      characterId,
      file.type
    );
    const { uploadUrl, imageUrl } = uploadUrlResponse.data.data;

    // Step 2: Upload to S3
    await uploadToS3(uploadUrl, file, file.type, onProgress);

    // Step 3: Update character's image URL in database
    const updateResponse = await updateCharacterImage(characterId, imageUrl);

    return updateResponse;
  } catch (error) {
    logger.error("Character image upload process failed:", error);
    throw error;
  }
};

const CharacterService = {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  generateImageUploadUrl,
  uploadToS3,
  updateCharacterImage,
  deleteCharacterImage,
  validateImageFile,
  uploadCharacterImage,
};

export default CharacterService;
