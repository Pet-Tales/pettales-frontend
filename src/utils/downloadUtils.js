/**
 * Download a file from a URL to the user's local machine
 * @param {string} url - The URL of the file to download
 * @param {string} filename - The desired filename for the downloaded file
 */
export const downloadFile = async (url, filename) => {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

import { API_BASE_URL } from "@/utils/constants";

/**
 * Download a book PDF using the API endpoint (bypasses CORS issues)
 * @param {string} bookId - The book ID
 * @param {string} filename - The desired filename for the downloaded file
 */
export const downloadBookPDF = async (bookId, filename) => {
  try {
    const baseUrl = API_BASE_URL || "http://127.0.0.1:3000";
    const url = `${baseUrl}/api/books/${bookId}/download-pdf`;

    // Fetch the PDF through our API endpoint
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default error message
      }
      throw new Error(errorMessage);
    }

    // Get the blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("PDF download failed:", error);
    throw error;
  }
};

/**
 * Generate a filename for a book PDF
 * @param {Object} book - The book object
 * @returns {string} - The generated filename
 */
export const generateBookPdfFilename = (book) => {
  // Sanitize the title for use as filename
  const sanitizedTitle = book.title
    .replace(/[^a-zA-Z0-9\s-_]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 50); // Limit length

  return `${sanitizedTitle}_${book.id}.pdf`;
};
