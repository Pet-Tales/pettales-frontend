/**
 * Download a file from a URL to the user's local machine
 * @param {string} url - The URL of the file to download
 * @param {string} filename - The desired filename for the downloaded file (optional, used as suggestion)
 * @param {boolean} showSaveDialog - Whether to show browser's save dialog (default: true)
 */
export const downloadFile = async (url, filename, showSaveDialog = true) => {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the blob
    const blob = await response.blob();

    if (showSaveDialog && "showSaveFilePicker" in window) {
      // Use File System Access API for modern browsers
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename || "download.pdf",
          types: [
            {
              description: "PDF files",
              accept: {
                "application/pdf": [".pdf"],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (fsError) {
        // User cancelled or API not supported, fall back to regular download
        if (fsError.name !== "AbortError") {
          console.warn(
            "File System Access API failed, falling back to regular download:",
            fsError
          );
        } else {
          // User cancelled the save dialog
          throw new Error("Download cancelled by user");
        }
      }
    }

    // Fallback: Create a temporary URL for the blob and use regular download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "download.pdf";

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
 * Download a book PDF using the API endpoint (handles payment flow)
 * @param {string} bookId - The book ID
 * @param {string} filename - The desired filename for the downloaded file (optional, used as suggestion)
 * @param {string} sessionId - Optional Stripe session ID for guest users
 * @param {boolean} showSaveDialog - Whether to show browser's save dialog (default: true)
 * @param {string|null} charityId - Optional charity ID selected by user
 * @returns {Promise<Object>} - Result object with success status and any payment info
 */
export const downloadBookPDF = async (
  bookId,
  filename,
  sessionId = null,
  showSaveDialog = true,
  charityId = null
) => {
  try {
    const baseUrl = API_BASE_URL || "http://127.0.0.1:3000";
    let url = `${baseUrl}/api/books/${bookId}/download-pdf`;

    const params = new URLSearchParams();
    if (sessionId) params.set("session_id", sessionId);
    if (charityId) params.set("charity_id", charityId);
    const query = params.toString();
    if (query) {
      url += `?${query}`;
    }

    // Fetch the PDF through our API endpoint
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default error message
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Check if response is JSON (payment required) or binary (PDF file)
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Payment required or pre-check response (e.g., charity selection required)
      const data = await response.json();
      return {
        success: false,
        requiresPayment: data.requiresPayment,
        isGuest: data.isGuest,
        checkoutUrl: data.checkoutUrl,
        charityRequired: data.charityRequired,
        message: data.message,
      };
    }

    // PDF file response - proceed with download
    const blob = await response.blob();

    if (showSaveDialog && "showSaveFilePicker" in window) {
      // Use File System Access API for modern browsers
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename || "book.pdf",
          types: [
            {
              description: "PDF files",
              accept: {
                "application/pdf": [".pdf"],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        return {
          success: true,
          downloaded: true,
        };
      } catch (fsError) {
        // User cancelled or API not supported, fall back to regular download
        if (fsError.name !== "AbortError") {
          console.warn(
            "File System Access API failed, falling back to regular download:",
            fsError
          );
        } else {
          // User cancelled the save dialog
          throw new Error("Download cancelled by user");
        }
      }
    }

    // Fallback: Create a temporary URL for the blob and use regular download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "book.pdf";

    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return {
      success: true,
      downloaded: true,
    };
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
