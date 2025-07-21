/**
 * Navigation utilities for handling smart back navigation
 * and authentication flow edge cases
 */

/**
 * Authentication pages that should be skipped when navigating back
 */
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Smart back navigation that skips authentication pages
 * @param {Function} navigate - React Router navigate function
 * @param {string} fallbackPath - Fallback path if no suitable history found
 * @param {boolean} isAuthenticated - Whether user is authenticated
 */
export const smartNavigateBack = (
  navigate,
  fallbackPath = "/",
  isAuthenticated = false
) => {
  // Get the current path to avoid infinite loops
  const currentPath = window.location.pathname;

  // Check if we have history to work with
  if (window.history.length <= 1) {
    navigate(fallbackPath);
    return;
  }

  // For authenticated users coming from auth flow, we need to be smarter
  if (isAuthenticated) {
    // Check if there's a redirect parameter in the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get("redirect");

    if (redirectPath) {
      // If we have a redirect parameter, it means we came from that page originally
      try {
        const decodedPath = decodeURIComponent(redirectPath);
        // Extract the base path without query parameters for navigation
        const basePath = decodedPath.split("?")[0];
        navigate(basePath);
        return;
      } catch (error) {
        console.warn("Failed to decode redirect path:", redirectPath);
      }
    }
  }

  // Try to go back, but with a fallback mechanism
  // We'll use a combination of history API and fallback
  try {
    // Check if the previous page in history is an auth page
    // Since we can't directly access history entries, we'll use a heuristic approach

    // If we're on a page that typically comes after auth (like book creation with template),
    // and the user is authenticated, try to extract the original source
    if (isAuthenticated && currentPath.includes("/books/create")) {
      const urlParams = new URLSearchParams(window.location.search);
      const templateId = urlParams.get("template");

      if (templateId) {
        // User came from gallery via "use as template" flow
        navigate("/gallery");
        return;
      }
    }

    // Default behavior: go back one step
    navigate(-1);
  } catch (error) {
    console.warn("Navigation error, using fallback:", error);
    navigate(fallbackPath);
  }
};

/**
 * Get appropriate fallback path based on user authentication status
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {string} currentPath - Current page path
 * @returns {string} Appropriate fallback path
 */
export const getFallbackPath = (isAuthenticated, currentPath = "") => {
  if (!isAuthenticated) {
    return "/gallery";
  }

  // For authenticated users, determine best fallback based on current page
  if (currentPath.includes("/books/")) {
    return "/my-books";
  }

  if (currentPath.includes("/characters/")) {
    return "/characters";
  }

  return "/my-books";
};

/**
 * Check if a path is an authentication page
 * @param {string} path - Path to check
 * @returns {boolean} True if it's an auth page
 */
export const isAuthPage = (path) => {
  return AUTH_PAGES.some((authPath) => path.startsWith(authPath));
};

/**
 * Get redirect path for authenticated users trying to access auth pages
 * @param {string} currentPath - Current auth page path
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string} Path to redirect to
 */
export const getAuthPageRedirect = (currentPath, searchParams) => {
  // Check if there's a redirect parameter
  const redirectPath = searchParams.get("redirect");

  if (redirectPath) {
    try {
      return decodeURIComponent(redirectPath);
    } catch (error) {
      console.warn("Failed to decode redirect path:", redirectPath);
    }
  }

  // Default redirect for authenticated users
  return "/my-books";
};
