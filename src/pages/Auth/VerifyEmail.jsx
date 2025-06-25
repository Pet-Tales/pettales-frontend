import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { verifyEmail, clearError } from "@/stores/reducers/auth";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error } = useSelector((state) => state.auth);
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
  const [countdown, setCountdown] = useState(5);
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    const token = searchParams.get("token");

    // Prevent double verification calls
    if (hasVerified.current) {
      return;
    }

    if (token) {
      hasVerified.current = true; // Mark as attempting verification

      dispatch(verifyEmail(token))
        .then((result) => {
          if (verifyEmail.fulfilled.match(result)) {
            setVerificationStatus("success");
            toast.success(t("toast.emailVerifiedSuccess"), {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          } else {
            setVerificationStatus("error");
            toast.error(result.payload || t("toast.emailVerificationFailed"), {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        })
        .catch((err) => {
          setVerificationStatus("error");
          toast.error(t("toast.emailVerificationFailed"), {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
    } else {
      setVerificationStatus("error");
      toast.error(t("toast.noVerificationToken"), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, searchParams]);

  // Auto-redirect countdown when verification is successful
  useEffect(() => {
    if (verificationStatus === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            navigate("/dashboard");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus, navigate]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to PetTalesAI!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been verified and you're now logged in.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds...
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard Now
              </button>
              <div>
                <button
                  onClick={() => navigate("/")}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verification failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || "The verification link is invalid or has expired."}
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create new account
              </button>
              <div>
                <button
                  onClick={() => navigate("/login")}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to login
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">{renderContent()}</div>
    </div>
  );
};

export default VerifyEmail;
