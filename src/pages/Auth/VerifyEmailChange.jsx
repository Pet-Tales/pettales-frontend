import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { toast } from "react-toastify";

import { verifyEmailChange } from "@/stores/reducers/auth";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";

const VerifyEmailChange = () => {
  const { t } = useValidatedTranslation();
  const { translateError } = useErrorTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, failed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setVerificationStatus("failed");
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await dispatch(verifyEmailChange(token));
        
        if (verifyEmailChange.fulfilled.match(result)) {
          setVerificationStatus("success");
          toast.success(t("toast.emailChangeVerified"));
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            navigate("/profile");
          }, 3000);
        } else {
          setVerificationStatus("failed");
          const errorMessage = translateError(
            result.payload || "Email change verification failed"
          );
          toast.error(errorMessage);
        }
      } catch (error) {
        logger.error("Email change verification error:", error);
        setVerificationStatus("failed");
        toast.error(t("toast.emailChangeVerificationFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, dispatch, navigate, t, translateError]);

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardBody className="p-8 text-center">
            {verificationStatus === "verifying" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-light-yellow mx-auto mb-4"></div>
                <Typography variant="h4" className="text-gray-900 mb-2">
                  {t("verifyEmail.verifying")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("verifyEmail.verifyingMessage")}
                </Typography>
              </>
            )}

            {verificationStatus === "success" && (
              <>
                <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <Typography variant="h4" className="text-gray-900 mb-2">
                  {t("profile.emailChangeVerified")}
                </Typography>
                <Typography className="text-gray-600 mb-6">
                  Your email address has been successfully updated.
                </Typography>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-custom-light-yellow hover:bg-custom-light-yellow/90"
                    onClick={handleGoToProfile}
                  >
                    Go to Profile
                  </Button>
                  <Button
                    variant="outlined"
                    className="w-full"
                    onClick={handleGoToHome}
                  >
                    {t("verifyEmail.backToHome")}
                  </Button>
                </div>
              </>
            )}

            {verificationStatus === "failed" && (
              <>
                <div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <Typography variant="h4" className="text-gray-900 mb-2">
                  {t("profile.emailChangeVerificationFailed")}
                </Typography>
                <Typography className="text-gray-600 mb-6">
                  The email change verification link is invalid or has expired.
                </Typography>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-custom-light-yellow hover:bg-custom-light-yellow/90"
                    onClick={handleGoToProfile}
                  >
                    Go to Profile
                  </Button>
                  <Button
                    variant="outlined"
                    className="w-full"
                    onClick={handleGoToHome}
                  >
                    {t("verifyEmail.backToHome")}
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailChange;
