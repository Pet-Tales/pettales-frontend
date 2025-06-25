import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import logger from "@/utils/logger";
// import { getCurrentUser } from "@/stores/reducers/auth"; // Removed - App component handles session validation

const ProtectedRoute = ({ children, requireEmailVerification = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading,
    hasAttemptedAuth,
    isValidatingSession,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Don't make duplicate calls - let App component handle session validation
    // Only try to get current user if we haven't attempted auth yet, not currently loading, and not already validating
    if (!hasAttemptedAuth && !isLoading && !isValidatingSession) {
      logger.info(
        "ProtectedRoute: Session validation not started, skipping duplicate call"
      );
      // Don't dispatch getCurrentUser here - let App component handle it
    }
  }, [dispatch, hasAttemptedAuth, isLoading, isValidatingSession]);

  // Show loading spinner while checking authentication or validating session
  if (isLoading || !hasAttemptedAuth || isValidatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated (only after we've attempted auth)
  if (!isAuthenticated && hasAttemptedAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email verification required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please verify your email address to access this page.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Check your email for a verification link, or contact support if
              you need help.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
