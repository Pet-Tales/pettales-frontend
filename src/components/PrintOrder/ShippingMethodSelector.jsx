import { useState, useEffect } from "react";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  Radio,
  Button,
  Spinner,
  Chip,
} from "@material-tailwind/react";
import { FaArrowLeft, FaArrowRight, FaTruck, FaClock } from "react-icons/fa";
import PrintOrderService from "@/services/printOrderService";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const ShippingMethodSelector = ({
  orderData,
  updateOrderData,
  costData,
  book,
  bookId,
  onNext,
  onBack,
  loading,
  onCostDataUpdate,
}) => {
  const { t } = useValidatedTranslation();
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [recalculatingCost, setRecalculatingCost] = useState(false);
  const [currentCostData, setCurrentCostData] = useState(costData);

  // Default shipping options
  const defaultShippingOptions = [
    {
      level: "MAIL",
      name: t("printOrder.shipping.methods.mail.name"),
      description: t("printOrder.shipping.methods.mail.description"),
      estimatedDays: t("printOrder.shipping.methods.mail.estimatedDays"),
      icon: FaTruck,
    },
    {
      level: "PRIORITY_MAIL",
      name: t("printOrder.shipping.methods.priorityMail.name"),
      description: t("printOrder.shipping.methods.priorityMail.description"),
      estimatedDays: t(
        "printOrder.shipping.methods.priorityMail.estimatedDays"
      ),
      icon: FaTruck,
    },
    {
      level: "GROUND",
      name: t("printOrder.shipping.methods.ground.name"),
      description: t("printOrder.shipping.methods.ground.description"),
      estimatedDays: t("printOrder.shipping.methods.ground.estimatedDays"),
      icon: FaTruck,
    },
    {
      level: "EXPEDITED",
      name: t("printOrder.shipping.methods.expedited.name"),
      description: t("printOrder.shipping.methods.expedited.description"),
      estimatedDays: t("printOrder.shipping.methods.expedited.estimatedDays"),
      icon: FaClock,
    },
    {
      level: "EXPRESS",
      name: t("printOrder.shipping.methods.express.name"),
      description: t("printOrder.shipping.methods.express.description"),
      estimatedDays: t("printOrder.shipping.methods.express.estimatedDays"),
      icon: FaClock,
    },
  ];

  // Load shipping options on component mount and auto-select first option, then calculate cost
  useEffect(() => {
    const loadShippingOptions = async () => {
      try {
        setLoadingOptions(true);
        const response = await PrintOrderService.getShippingOptions({
          shippingAddress: orderData.shippingAddress,
          bookId: bookId,
        });

        let options = [];
        const optionsApiSucceeded = !!response.success;
        if (optionsApiSucceeded) {
          options = response.data;
          setShippingOptions(options);
        } else {
          // Fallback to default options (no API data)
          options = defaultShippingOptions;
          setShippingOptions(options);
        }

        // If options came from API, select first valid option by default and calculate cost
        if (optionsApiSucceeded && options.length) {
          const availableLevels = new Set(options.map((o) => o.level));
          const selectedLevel =
            orderData.shippingLevel &&
            availableLevels.has(orderData.shippingLevel)
              ? orderData.shippingLevel
              : options[0]?.level;

          if (selectedLevel) {
            await handleShippingMethodChange(selectedLevel);
          }
        }
      } catch (error) {
        logger.error("Failed to load shipping options:", error);
        // Fallback to default options
        setShippingOptions(defaultShippingOptions);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadShippingOptions();
    // We intentionally exclude handleShippingMethodChange from deps to avoid loop
    // Only re-run when address or book changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData.shippingAddress, bookId]);

  // Handle shipping method change: set selection and calculate cost
  const handleShippingMethodChange = async (shippingLevel) => {
    try {
      setRecalculatingCost(true);
      // Update order data immediately for UI selection
      updateOrderData({ shippingLevel });

      const costResponse = await PrintOrderService.calculateCost({
        bookId: bookId,
        quantity: orderData.quantity,
        shippingAddress: orderData.shippingAddress,
        shippingLevel: shippingLevel,
      });

      if (costResponse.success) {
        setCurrentCostData(costResponse.data);
        if (onCostDataUpdate) onCostDataUpdate(costResponse.data);
      } else {
        throw new Error(costResponse.message);
      }
    } catch (error) {
      logger.error("Failed to calculate cost:", error);
      toast.error(error.message || t("printOrder.errors.recalculateCost"));
    } finally {
      setRecalculatingCost(false);
    }
  };

  // Format price  
  const formatPrice = (usd) => {
    return `$${(usd || 0).toFixed(2)}`;
  };

  if (loadingOptions) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="mb-4">
          {t("printOrder.shipping.selectMethod")}
        </Typography>
        <Typography variant="small" className="text-gray-600 mb-6">
          {t("printOrder.shipping.selectMethodDescription")}
        </Typography>
      </div>

      {/* Order Summary (costs will be calculated on the next step) */}
      <Card className="bg-gray-50">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            {t("printOrder.orderSummary")}
          </Typography>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Typography variant="small">{t("printOrder.book")}:</Typography>
              <Typography variant="small" className="font-medium">
                {book.title}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="small">
                {t("printOrder.quantity")}:
              </Typography>
              <Typography variant="small" className="font-medium">
                {orderData.quantity}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="small">{t("printOrder.pages")}:</Typography>
              <Typography variant="small" className="font-medium">
                {book.pageCount}
              </Typography>
            </div>
            {currentCostData ? (
              <>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <Typography variant="small">
                    {t("printOrder.printingCost")}:
                  </Typography>
                  <Typography variant="small">
                    {formatPrice(
                      (() => {
                        const lineItemCost = parseFloat(
                          currentCostData.cost_breakdown?.line_items?.[0]
                            ?.total_cost_incl_tax || 0
                        );
                        const fulfillmentCost = parseFloat(
                          currentCostData.cost_breakdown?.fulfillment
                            ?.total_cost_incl_tax || 0
                        );
                        const basePrintingCost = lineItemCost + fulfillmentCost;
                        const baseShippingCost = parseFloat(
                          currentCostData.cost_breakdown?.shipping
                            ?.total_cost_incl_tax || 0
                        );
                        const totalBaseCost =
                          basePrintingCost + baseShippingCost;
                        const finalTotalCost = parseFloat(
                          currentCostData.total_cost_usd || 0
                        );
                        const printingProportion =
                          totalBaseCost > 0
                            ? basePrintingCost / totalBaseCost
                            : 0;
                        const finalPrintingCost =
                          finalTotalCost * printingProportion;
                        return finalPrintingCost;
                      })()
                    )}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="small">
                    {t("printOrder.shippingCost")}:
                  </Typography>
                  <Typography variant="small">
                    {recalculatingCost ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      formatPrice(
                        (() => {
                          const lineItemCost = parseFloat(
                            currentCostData.cost_breakdown?.line_items?.[0]
                              ?.total_cost_incl_tax || 0
                          );
                          const fulfillmentCost = parseFloat(
                            currentCostData.cost_breakdown?.fulfillment
                              ?.total_cost_incl_tax || 0
                          );
                          const basePrintingCost =
                            lineItemCost + fulfillmentCost;
                          const baseShippingCost = parseFloat(
                            currentCostData.cost_breakdown?.shipping
                              ?.total_cost_incl_tax || 0
                          );
                          const totalBaseCost =
                            basePrintingCost + baseShippingCost;
                          const finalTotalCost = parseFloat(
                            currentCostData.total_cost_usd || 0
                          );
                          const shippingProportion =
                            totalBaseCost > 0
                              ? baseShippingCost / totalBaseCost
                              : 0;
                          const finalShippingCost =
                            finalTotalCost * shippingProportion;
                          return finalShippingCost;
                        })()
                      )
                    )}
                  </Typography>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <Typography variant="small" className="font-bold">
                    {t("printOrder.total")}:
                  </Typography>
                  <Typography variant="small" className="font-bold">
                    {recalculatingCost ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      formatPrice(currentCostData.total_cost_usd)
                    )}
                  </Typography>
                </div>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Spinner className="h-4 w-4" />
                  <Typography variant="small">{t("common.loading")}</Typography>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Shipping Methods */}
      <div className="space-y-4">
        {shippingOptions.map((option) => {
          const IconComponent = option.icon || FaTruck;
          const isSelected = orderData.shippingLevel === option.level;

          return (
            <Card
              key={option.level}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleShippingMethodChange(option.level)}
            >
              <CardBody className="flex items-center gap-4">
                <Radio
                  name="shippingMethod"
                  checked={isSelected}
                  onChange={() => handleShippingMethodChange(option.level)}
                  disabled={recalculatingCost}
                />
                <IconComponent className="h-6 w-6 text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Typography variant="h6">{option.name}</Typography>
                    <Chip
                      size="sm"
                      value={option.estimatedDays}
                      className="bg-gray-200 text-gray-700"
                    />
                  </div>
                  <Typography variant="small" className="text-gray-600">
                    {option.description}
                  </Typography>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outlined"
          className="flex items-center gap-2"
          onClick={onBack}
          disabled={loading}
        >
          <FaArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Button
          className="flex items-center gap-2"
          onClick={onNext}
          disabled={loading || recalculatingCost || !currentCostData}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaArrowRight className="h-4 w-4" />
          )}
          {loading ? t("common.loading") : t("printOrder.reviewOrder")}
        </Button>
      </div>
    </div>
  );
};

export default ShippingMethodSelector;
