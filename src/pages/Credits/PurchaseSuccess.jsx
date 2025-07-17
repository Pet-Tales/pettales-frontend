import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { FaCheckCircle, FaExclamationTriangle, FaCoins } from "react-icons/fa";
import {
  verifyPurchase,
  clearError,
  fetchCreditBalance,
} from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const PurchaseSuccess = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const translateError = useErrorTranslation();

  const { user } = useSelector((state) => state.auth);
  const { isVerifyingPurchase, error } = useSelector((state) => state.credits);

  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const hasVerifiedRef = useRef(false);

  const verifyPurchaseAsync = useCallback(
    async (sessionId) => {
      if (hasVerifiedRef.current) {
        return; // Already verified, don't run again
      }

      hasVerifiedRef.current = true;

      try {
        const result = await dispatch(verifyPurchase(sessionId)).unwrap();
        setVerificationStatus("success");
        setPurchaseDetails(result.data);
        toast.success(t("credits.purchaseSuccess"));

        // Refresh credit balance to ensure UI is up to date
        dispatch(fetchCreditBalance());
      } catch (error) {
        logger.error("Purchase verification failed:", error);
        setVerificationStatus("error");
        hasVerifiedRef.current = false; // Reset on error so user can retry
      }
    },
    [dispatch, t]
  );

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setVerificationStatus("error");
      return;
    }

    if (!user) {
      // User not logged in, redirect to login with return URL
      navigate(
        `/login?returnTo=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
      return;
    }

    // Only verify if we haven't already done so
    if (!hasVerifiedRef.current) {
      verifyPurchaseAsync(sessionId);
    }
  }, [searchParams, user, navigate, verifyPurchaseAsync]);

  useEffect(() => {
    if (error) {
      const errorMessage = translateError(error);
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, translateError, dispatch]);

  const handleContinue = () => {
    navigate("/my-books");
  };

  const handleBuyMore = () => {
    navigate("/pricing");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardBody className="text-center p-8">
            {verificationStatus === "pending" || isVerifyingPurchase ? (
              <>
                <Spinner className="h-12 w-12 mx-auto mb-6" />
                <Typography variant="h4" className="mb-4">
                  {t("credits.verifyingPurchase")}
                </Typography>
                <Typography variant="lead" className="text-gray-600">
                  {t("credits.pleaseWait")}
                </Typography>
              </>
            ) : verificationStatus === "success" ? (
              <>
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
                <Typography variant="h3" className="mb-4 text-green-600">
                  {t("credits.purchaseSuccessTitle")}
                </Typography>
                <Typography variant="lead" className="text-gray-600 mb-6">
                  {t("credits.purchaseSuccessMessage")}
                </Typography>

                {purchaseDetails && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <FaCoins className="text-yellow-500" />
                      <Typography variant="h5">
                        {t("credits.purchaseDetails")}
                      </Typography>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Typography variant="small" className="text-gray-600">
                          {t("credits.creditsAdded")}:
                        </Typography>
                        <Typography variant="small" className="font-medium">
                          {purchaseDetails.creditsAdded?.toLocaleString()}
                        </Typography>
                      </div>

                      <div className="flex justify-between">
                        <Typography variant="small" className="text-gray-600">
                          {t("credits.newBalance")}:
                        </Typography>
                        <Typography variant="small" className="font-medium">
                          {purchaseDetails.newBalance?.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    color="blue"
                    size="lg"
                    onClick={handleContinue}
                    className="flex items-center justify-center gap-2"
                  >
                    {t("credits.continueToBooks")}
                  </Button>

                  <Button
                    variant="outlined"
                    color="blue"
                    size="lg"
                    onClick={handleBuyMore}
                    className="flex items-center justify-center gap-2"
                  >
                    <FaCoins />
                    {t("credits.buyMoreCredits")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-6" />
                <Typography variant="h3" className="mb-4 text-red-600">
                  {t("credits.verificationFailed")}
                </Typography>
                <Typography variant="lead" className="text-gray-600 mb-6">
                  {t("credits.verificationFailedMessage")}
                </Typography>

                <Alert color="red" className="mb-6">
                  <Typography variant="small">
                    {t("credits.contactSupport")}
                  </Typography>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    color="blue"
                    size="lg"
                    onClick={handleBuyMore}
                    className="flex items-center justify-center gap-2"
                  >
                    {t("credits.tryAgain")}
                  </Button>

                  <Button
                    variant="outlined"
                    color="gray"
                    size="lg"
                    onClick={() => navigate("/")}
                  >
                    {t("credits.backToHome")}
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

export default PurchaseSuccess;
