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
// ⛔ removed: import { createPurchaseSession, clearError } from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const Pricing = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // ⛔ removed: const { isCreatingSession, error } = useSelector((state) => state.credits);
  const translateError = useErrorTranslation();

  // Credit costs for different book types
  const creditCosts = {
    book12: 400,
    book16: 450,
    book24: 500,
    regeneration: 16,
  };

  // Suggested credit packages
  const suggestedPackages = [
    { credits: 250, price: 2.5, popular: false },
    { credits: 500, price: 5.0, popular: true },
    { credits: 1000, price: 10.0, popular: false },
  ];

  // ⛔ removed effect that handled credits slice errors
  // useEffect(() => {
  //   if (error) {
  //     const errorMessage = translateError(error);
  //     toast.error(errorMessage);
  //     dispatch(clearError());
  //   }
  // }, [error, translateError, dispatch]);

  // ⛔ removed credits purchase handlers
  // const handlePurchase = async (creditAmount) => { ... }
  // const handleCustomPurchase = () => { ... }

  // ⛔ removed: const [customAmount, setCustomAmount] = useState("");
  // ⛔ removed: const [isCustomAmountValid, setIsCustomAmountValid] = useState(true);

  // ⛔ removed: const formatPrice = (price) => { ... };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="text-gray-900 mb-4">
            {t("pricing.title")}
          </Typography>
          <Typography
            variant="lead"
            className="text-gray-600 max-w-3xl mx-auto"
          >
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

        {/* ⛔ removed Suggested Packages section */}
        {/* ⛔ removed Custom Amount section */}
        {/* ⛔ removed Current Balance section */}
      </div>
    </div>
  );
};

export default Pricing;
