import http from "@/utils/http";

/**
 * Regenerate front cover illustration
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} - API response with new image URL
 */
export const regenerateFrontCover = async (bookId) => {
  try {
    const response = await http.post(
      `/api/illustrations/regenerate/front-cover/${bookId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Regenerate back cover illustration
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} - API response with new image URL
 */
export const regenerateBackCover = async (bookId) => {
  try {
    const response = await http.post(
      `/api/illustrations/regenerate/back-cover/${bookId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Regenerate page illustration
 * @param {string} pageId - Page ID
 * @returns {Promise<Object>} - API response with new image URL
 */
export const regeneratePageIllustration = async (pageId) => {
  try {
    const response = await http.post(
      `/api/illustrations/regenerate/page/${pageId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const IllustrationService = {
  regenerateFrontCover,
  regenerateBackCover,
  regeneratePageIllustration,
};

export default IllustrationService;
