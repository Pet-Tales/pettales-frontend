import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const API_URL = `${API_BASE_URL}/api/print-orders`;

class PrintOrderService {
  /**
   * Calculate print order cost
   */
  async calculateCost(orderData) {
    try {
      const response = await axios.post(
        `${API_URL}/calculate-cost`,
        orderData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new print order
   */
  async createPrintOrder(orderData) {
    try {
      const response = await axios.post(`${API_URL}/create`, orderData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's print orders
   */
  async getUserPrintOrders(params = {}) {
    try {
      const response = await axios.get(API_URL, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific print order
   */
  async getPrintOrder(orderId) {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a print order
   */
  async cancelPrintOrder(orderId) {
    try {
      const response = await axios.delete(`${API_URL}/${orderId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get print order status from Lulu
   */
  async getPrintOrderStatus(orderId) {
    try {
      const response = await axios.get(`${API_URL}/${orderId}/status`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available shipping options for a location
   */
  async getShippingOptions(requestData) {
    try {
      const response = await axios.post(
        `${API_URL}/shipping-options`,
        requestData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.message || "An error occurred",
        errors: data.errors || [],
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: "Network error. Please check your connection.",
        errors: [],
      };
    } else {
      // Other error
      return {
        status: 0,
        message: error.message || "An unexpected error occurred",
        errors: [],
      };
    }
  }
}

export default new PrintOrderService();
