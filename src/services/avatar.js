import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/user";

/**
 * Generate presigned URL for avatar upload
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise} - Promise resolving to upload URL data
 */
const generateUploadUrl = (contentType) => {
  return new Promise((resolve, reject) => {
    http
      .post(_API + "/avatar/upload-url", { contentType })
      .then((response) => {
        if (response.status === 200) {
          logger.api(
            "POST",
            _API + "/avatar/upload-url",
            response.status,
            0,
            response.data
          );
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api(
            "POST",
            _API + "/avatar/upload-url",
            response.status,
            0,
            response.data
          );
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "POST",
          _API + "/avatar/upload-url",
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
 * Upload file to S3 using presigned URL
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
        logger.info("File uploaded successfully to S3");
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
 * Update user's avatar URL in the database
 * @param {string} avatarUrl - The CloudFront URL of the uploaded avatar
 * @returns {Promise} - Promise resolving to updated user data
 */
const updateAvatarUrl = (avatarUrl) => {
  return new Promise((resolve, reject) => {
    http
      .put(_API + "/avatar", { avatarUrl })
      .then((response) => {
        if (response.status === 200) {
          logger.api(
            "PUT",
            _API + "/avatar",
            response.status,
            0,
            response.data
          );
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api(
            "PUT",
            _API + "/avatar",
            response.status,
            0,
            response.data
          );
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        logger.api(
          "PUT",
          _API + "/avatar",
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
 * Validate file for avatar upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and error message
 */
const validateAvatarFile = (file) => {
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
 * Complete avatar upload process
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - Promise resolving to updated user data
 */
const uploadAvatar = async (file, onProgress = null) => {
  try {
    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Step 1: Generate presigned URL
    const uploadUrlResponse = await generateUploadUrl(file.type);
    const { uploadUrl, avatarUrl } = uploadUrlResponse.data.data;

    // Step 2: Upload to S3
    await uploadToS3(uploadUrl, file, file.type, onProgress);

    // Step 3: Update user's avatar URL in database
    const updateResponse = await updateAvatarUrl(avatarUrl);

    return updateResponse;
  } catch (error) {
    logger.error("Avatar upload process failed:", error);
    throw error;
  }
};

const AvatarService = {
  generateUploadUrl,
  uploadToS3,
  updateAvatarUrl,
  validateAvatarFile,
  uploadAvatar,
};

export default AvatarService;
