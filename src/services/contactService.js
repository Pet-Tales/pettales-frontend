import http from "@/utils/http";
import logger from "@/utils/logger";

const _API = "/api/contact";

/**
 * Contact Service
 * Handles contact form submissions
 */
class ContactService {
  /**
   * Submit contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Contact person's name
   * @param {string} contactData.email - Contact person's email
   * @param {string} contactData.subject - Contact subject
   * @param {string} contactData.message - Contact message
   * @param {string} contactData.language - Language preference (optional)
   * @returns {Promise<Object>} API response
   */
  static async submitContactForm(contactData) {
    return new Promise((resolve, reject) => {
      http
        .post(_API, contactData)
        .then((response) => {
          logger.info("Contact form submitted successfully");
          resolve(response);
        })
        .catch((error) => {
          logger.error("Contact form submission failed:", error);
          reject(error);
        });
    });
  }
}

export default ContactService;
