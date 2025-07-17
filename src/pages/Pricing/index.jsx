import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Alert,
} from "@material-tailwind/react";
import { FaCreditCard, FaCoins, FaBook, FaImage } from "react-icons/fa";
import { createPurchaseSession, clearError } from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const Pricing = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isCreatingSession, error } = useSelector((state) => state.credits);
  const translateError = useErrorTranslation();

  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmountValid, setIsCustomAmountValid] = useState(true);

  // Credit costs for different book types
  const creditCosts = {
    book12: 250,
    book16: 300,
    book24: 350,
    regeneration: 16,
  };

  // Suggested credit packages
  const suggestedPackages = [
    { credits: 250, price: 2.5, popular: false },
    { credits: 500, price: 5.0, popular: true },
    { credits: 1000, price: 10.0, popular: false },
  ];

  useEffect(() => {
    if (error) {
      const errorMessage = translateError(error);
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, translateError, dispatch]);

  const handlePurchase = async (creditAmount) => {
    if (!user) {
      toast.error(t("pricing.loginRequired"));
      return;
    }

    try {
      const result = await dispatch(createPurchaseSession(creditAmount)).unwrap();
      
      // Redirect to Stripe checkout
      if (result.data.url) {
        window.location.href = result.data.url;
      } else {
        toast.error(t("pricing.checkoutError"));
      }
    } catch (error) {
      logger.error("Purchase session creation failed:", error);
      // Error is handled by useEffect above
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    
    if (!amount || amount <= 0 || amount > 100000) {
      setIsCustomAmountValid(false);
      return;
    }
    
    setIsCustomAmountValid(true);
    handlePurchase(amount);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="text-gray-900 mb-4">
            {t("pricing.title")}
          </Typography>
          <Typography variant="lead" className="text-gray-600 max-w-3xl mx-auto">
            {t("pricing.subtitle")}
          </Typography>
        </div>

        {/* Credit Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border border-gray-200">
            <CardBody className="text-center">
              <FaBook className="text-3xl text-blue-500 mx-auto mb-3" />
              <Typography variant="h6" className="mb-2">
                {t("pricing.book12Pages")}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {creditCosts.book12} {t("pricing.credits")}
              </Typography>
            </CardBody>
          </Card>

          <Card className="border border-gray-200">
            <CardBody className="text-center">
              <FaBook className="text-3xl text-green-500 mx-auto mb-3" />
              <Typography variant="h6" className="mb-2">
                {t("pricing.book16Pages")}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {creditCosts.book16} {t("pricing.credits")}
              </Typography>
            </CardBody>
          </Card>

          <Card className="border border-gray-200">
            <CardBody className="text-center">
              <FaBook className="text-3xl text-purple-500 mx-auto mb-3" />
              <Typography variant="h6" className="mb-2">
                {t("pricing.book24Pages")}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {creditCosts.book24} {t("pricing.credits")}
              </Typography>
            </CardBody>
          </Card>

          <Card className="border border-gray-200">
            <CardBody className="text-center">
              <FaImage className="text-3xl text-orange-500 mx-auto mb-3" />
              <Typography variant="h6" className="mb-2">
                {t("pricing.regeneration")}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {creditCosts.regeneration} {t("pricing.credits")}
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Suggested Packages */}
        <div className="mb-12">
          <Typography variant="h4" className="text-center mb-8">
            {t("pricing.suggestedPackages")}
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedPackages.map((pkg, index) => (
              <Card
                key={index}
                className={`border-2 ${
                  pkg.popular
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200"
                }`}
              >
                {pkg.popular && (
                  <CardHeader className="bg-blue-500 text-white text-center py-2">
                    <Typography variant="small" className="font-bold">
                      {t("pricing.popular")}
                    </Typography>
                  </CardHeader>
                )}
                
                <CardBody className="text-center">
                  <FaCoins className="text-4xl text-yellow-500 mx-auto mb-4" />
                  <Typography variant="h4" className="mb-2">
                    {pkg.credits.toLocaleString()}
                  </Typography>
                  <Typography variant="small" className="text-gray-600 mb-4">
                    {t("pricing.credits")}
                  </Typography>
                  <Typography variant="h5" className="mb-6 text-green-600">
                    {formatPrice(pkg.price)}
                  </Typography>
                  <Button
                    color="blue"
                    size="lg"
                    fullWidth
                    onClick={() => handlePurchase(pkg.credits)}
                    disabled={isCreatingSession}
                    className="flex items-center justify-center gap-2"
                  >
                    <FaCreditCard />
                    {isCreatingSession ? t("pricing.processing") : t("pricing.buyNow")}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="max-w-md mx-auto">
          <Card className="border border-gray-200">
            <CardBody>
              <Typography variant="h5" className="text-center mb-6">
                {t("pricing.customAmount")}
              </Typography>
              
              <div className="space-y-4">
                <Input
                  type="number"
                  label={t("pricing.enterCredits")}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="1"
                  max="100000"
                  error={!isCustomAmountValid}
                />
                
                {!isCustomAmountValid && (
                  <Alert color="red" className="text-sm">
                    {t("pricing.invalidAmount")}
                  </Alert>
                )}
                
                {customAmount && isCustomAmountValid && (
                  <Typography variant="small" className="text-center text-gray-600">
                    {t("pricing.total")}: {formatPrice(parseInt(customAmount) * 0.01)}
                  </Typography>
                )}
                
                <Button
                  color="blue"
                  size="lg"
                  fullWidth
                  onClick={handleCustomPurchase}
                  disabled={isCreatingSession || !customAmount}
                  className="flex items-center justify-center gap-2"
                >
                  <FaCreditCard />
                  {isCreatingSession ? t("pricing.processing") : t("pricing.buyNow")}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Current Balance */}
        {user && (
          <div className="text-center mt-8">
            <Typography variant="small" className="text-gray-600">
              {t("pricing.currentBalance")}: {user.creditsBalance || 0} {t("pricing.credits")}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
