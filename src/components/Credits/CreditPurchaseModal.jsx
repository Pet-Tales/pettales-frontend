import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Card,
  CardBody,
  Input,
} from "@material-tailwind/react";
import { FaCoins, FaCreditCard, FaTimes } from "react-icons/fa";
import { createPurchaseSession } from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const CreditPurchaseModal = ({
  isOpen,
  onClose,
  requiredCredits = 0,
  currentBalance = 0,
  onPurchaseStart,
}) => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();

  const { isCreatingSession } = useSelector((state) => state.credits);
  const { user } = useSelector((state) => state.auth);

  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmountValid, setIsCustomAmountValid] = useState(true);

  // Calculate shortfall
  const shortfall = Math.max(0, requiredCredits - currentBalance);

  // Suggested credit packages
  const suggestedPackages = [
    { credits: 250, price: 2.5, popular: false },
    { credits: 500, price: 5.0, popular: true },
    { credits: 1000, price: 10.0, popular: false },
  ];

  // Add shortfall package if it's not covered by existing packages
  const shortfallPackage =
    shortfall > 0
      ? {
          credits: shortfall,
          price: shortfall * 0.01,
          popular: false,
          isShortfall: true,
        }
      : null;

  const allPackages = shortfallPackage
    ? [shortfallPackage, ...suggestedPackages]
    : suggestedPackages;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const validateCustomAmount = (value) => {
    const numValue = parseInt(value);
    const isValid =
      value && !isNaN(numValue) && numValue > 0 && numValue <= 100000;
    setIsCustomAmountValid(isValid);
    return isValid;
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    validateCustomAmount(value);
  };

  const handlePurchase = async (creditAmount) => {
    if (!user) {
      toast.error(t("pricing.loginRequired"));
      return;
    }

    try {
      // Call the onPurchaseStart callback to save form data
      if (onPurchaseStart) {
        onPurchaseStart();
      }

      const result = await dispatch(
        createPurchaseSession({
          creditAmount,
          context: "book-creation",
        })
      ).unwrap();

      // Redirect to Stripe checkout
      if (result.data.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(t("pricing.checkoutError"));
      }
    } catch (error) {
      logger.error("Purchase session creation failed:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  const handleCustomPurchase = () => {
    const creditAmount = parseInt(customAmount);
    if (validateCustomAmount(customAmount)) {
      handlePurchase(creditAmount);
    }
  };

  return (
    <Dialog open={isOpen} handler={onClose} size="lg">
      <DialogHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCoins className="text-yellow-500" />
          <Typography variant="h4">{t("credits.purchaseCredits")}</Typography>
        </div>
        <Button variant="text" color="gray" onClick={onClose} className="p-2">
          <FaTimes />
        </Button>
      </DialogHeader>

      <DialogBody className="max-h-[70vh] overflow-y-auto">
        {/* Credit Requirement Info */}
        {shortfall > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <Typography variant="small" className="text-red-800 font-medium">
              {t("credits.insufficientCreditsMessage", {
                required: requiredCredits,
                current: currentBalance,
                shortfall: shortfall,
              })}
            </Typography>
          </div>
        )}

        {/* Credit Packages */}
        <div className="mb-6">
          <Typography variant="h6" className="mb-4">
            {t("credits.selectPackage")}
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPackages.map((pkg, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-lg h-full flex flex-col ${
                  pkg.popular ? "ring-2 ring-blue-500" : ""
                } ${pkg.isShortfall ? "bg-green-50 border-green-200" : ""}`}
              >
                {pkg.popular && (
                  <div className="bg-blue-500 text-white text-center py-1 text-xs font-medium rounded-t-lg">
                    {t("pricing.popular")}
                  </div>
                )}
                {pkg.isShortfall && (
                  <div className="bg-green-500 text-white text-center py-1 text-xs font-medium rounded-t-lg">
                    {t("credits.exactAmount")}
                  </div>
                )}

                <CardBody className="text-center flex-1 flex flex-col justify-between p-4">
                  <div className="flex-1">
                    <FaCoins className="text-3xl text-yellow-500 mx-auto mb-3" />
                    <Typography variant="h5" className="mb-2">
                      {pkg.credits.toLocaleString()}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 mb-3">
                      {t("pricing.credits")}
                    </Typography>
                    <Typography variant="h6" className="mb-4 text-green-600">
                      {formatPrice(pkg.price)}
                    </Typography>
                  </div>
                  <Button
                    color="blue"
                    size="sm"
                    fullWidth
                    onClick={() => handlePurchase(pkg.credits)}
                    disabled={isCreatingSession}
                    className="flex items-center justify-center gap-2 mt-auto"
                  >
                    <FaCreditCard />
                    {isCreatingSession
                      ? t("pricing.processing")
                      : t("pricing.buyNow")}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="border-t pt-6">
          <Typography variant="h6" className="mb-4">
            {t("pricing.customAmount")}
          </Typography>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                label={t("pricing.enterAmount")}
                value={customAmount}
                onChange={handleCustomAmountChange}
                min="1"
                max="100000"
                error={!isCustomAmountValid && customAmount !== ""}
              />
              {!isCustomAmountValid && customAmount && (
                <Typography variant="small" color="red" className="mt-1">
                  {t("pricing.invalidAmount")}
                </Typography>
              )}
            </div>
            <Button
              color="blue"
              onClick={handleCustomPurchase}
              disabled={
                isCreatingSession || !customAmount || !isCustomAmountValid
              }
              className="flex items-center gap-2"
            >
              <FaCreditCard />
              {isCreatingSession
                ? t("pricing.processing")
                : t("pricing.buyNow")}
            </Button>
          </div>
        </div>

        {/* Current Balance */}
        <div className="mt-6 text-center">
          <Typography variant="small" className="text-gray-600">
            {t("pricing.currentBalance")}: {currentBalance.toLocaleString()}{" "}
            {t("pricing.credits")}
          </Typography>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outlined"
          color="gray"
          onClick={onClose}
          disabled={isCreatingSession}
        >
          {t("common.cancel")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreditPurchaseModal;
