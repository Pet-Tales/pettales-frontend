import http from "@/utils/http";
import logger from "@/utils/logger";
import { DEBUG_MODE } from "@/utils/constants";

const _API = "/api/credits";

/**
 * Create a Stripe checkout session for credit purchase
 * @param {number} creditAmount - Number of credits to purchase
 * @returns {Promise<Object>} - API response with session data
 */
const createPurchaseSession = (creditAmount) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/purchase`;
    const data = { creditAmount };

    http
      .post(url, data)
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
 * Verify purchase completion and add credits to account
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} - API response with updated balance
 */
const verifyPurchase = (sessionId) => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/verify-purchase`;
    const data = { sessionId };

    http
      .post(url, data)
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
 * Get user's credit transaction history
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of transactions per page
 * @returns {Promise<Object>} - API response with transaction history
 */
const getCreditHistory = (page = 1, limit = 20) => {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${_API}/history?${params.toString()}`;

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
 * Get user's current credit balance
 * @returns {Promise<Object>} - API response with credit balance
 */
const getCreditBalance = () => {
  return new Promise((resolve, reject) => {
    const url = `${_API}/balance`;

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

const CreditService = {
  createPurchaseSession,
  verifyPurchase,
  getCreditHistory,
  getCreditBalance,
};

export default CreditService;
