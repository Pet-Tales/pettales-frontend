import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { useErrorTranslation } from "@/utils/errorMapper";
import {
  login,
  clearError,
  resendEmailVerification,
} from "@/stores/reducers/auth";
import { API_BASE_URL } from "@/utils/constants";
import { getAuthPageRedirect } from "@/utils/navigationUtils";

const Login = () => {
  const { t } = useValidatedTranslation();
  const translateError = useErrorTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = getAuthPageRedirect(
        window.location.pathname,
        searchParams
      );
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showError, setShowError] = useState(false);

  // Get translated error message
  const getTranslatedError = () => {
    if (!error) return null;

    // Extract error message from different possible formats
    let errorMessage = "";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = t("errors.loginFailed");
    }

    return translateError(errorMessage);
  };

  useEffect(() => {
    // Check for auth error from URL params
    const authError = searchParams.get("error");
    if (authError === "auth_failed") {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      // Check for redirect parameter
      const redirectPath = searchParams.get("redirect");
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    } else if (login.rejected.match(result)) {
      // The error will be displayed by the auth slice's error handling
    }
  };

  const handleGoogleLogin = () => {
    // Pass redirect parameter to Google OAuth
    const redirectPath = searchParams.get("redirect");
    const googleUrl = redirectPath
      ? `${API_BASE_URL}/api/auth/google?redirect=${encodeURIComponent(
          redirectPath
        )}`
      : `${API_BASE_URL}/api/auth/google`;
    window.location.href = googleUrl;
  };

  const handleResendVerification = async (email) => {
    try {
      const result = await dispatch(resendEmailVerification(email));
      if (resendEmailVerification.fulfilled.match(result)) {
        toast.success(t("toast.verificationEmailResent"), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      // Error will be handled by Redux state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.signInToAccount")}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || showError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {/* Check if this is an email not verified error */}
              {error &&
              (error.includes("AUTH_003") ||
                getTranslatedError() === t("errors.emailNotVerified")) ? (
                <div>
                  {t("errors.emailNotVerified")}{" "}
                  <button
                    type="button"
                    onClick={() => handleResendVerification(formData.email)}
                    className="font-medium underline hover:no-underline cursor-pointer"
                    disabled={isLoading}
                  >
                    {t("auth.resendVerification")}
                  </button>
                </div>
              ) : (
                getTranslatedError() || t("auth.authenticationFailed")
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("auth.emailAddress")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.emailAddress")}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.password")}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {t("auth.orContinueWith")}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">{t("auth.google")}</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t("auth.signUp")}
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
