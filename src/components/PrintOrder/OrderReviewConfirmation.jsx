import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { useSelector } from "react-redux";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Spinner,
  Alert,
  Chip,
} from "@material-tailwind/react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaBook,
  FaShippingFast,
  FaCreditCard,
  FaExclamationTriangle,
} from "react-icons/fa";

const OrderReviewConfirmation = ({
  orderData,
  costData,
  book,
  onSubmit,
  onBack,
  loading,
}) => {
  const { t } = useValidatedTranslation();
  const { user } = useSelector((state) => state.auth);

  // Format price
  const formatPrice = (usd) => {
    return `$${(usd || 0).toFixed(2)}`;
  };

  // Get shipping method display name
  const getShippingMethodName = (level) => {
    const methods = {
      MAIL: t("printOrder.shipping.methods.mail.name"),
      PRIORITY_MAIL: t("printOrder.shipping.methods.priorityMail.name"),
      GROUND: t("printOrder.shipping.methods.ground.name"),
      EXPEDITED: t("printOrder.shipping.methods.expedited.name"),
      EXPRESS: t("printOrder.shipping.methods.express.name"),
    };
    return methods[level] || level;
  };

  // Get shipping method estimated days
  const getShippingMethodEstimatedDays = (level) => {
    const estimatedDays = {
      MAIL: t("printOrder.shipping.methods.mail.estimatedDays"),
      PRIORITY_MAIL: t(
        "printOrder.shipping.methods.priorityMail.estimatedDays"
      ),
      GROUND: t("printOrder.shipping.methods.ground.estimatedDays"),
      EXPEDITED: t("printOrder.shipping.methods.expedited.estimatedDays"),
      EXPRESS: t("printOrder.shipping.methods.express.estimatedDays"),
    };
    return estimatedDays[level] || "";
  };


  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="mb-4">
          {t("printOrder.review.title")}
        </Typography>
        <Typography variant="small" className="text-gray-600 mb-6">
          {t("printOrder.review.description")}
        </Typography>
      </div>
      
      {/* Book Information */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <FaBook className="h-6 w-6 text-blue-600" />
            <Typography variant="h6">
              {t("printOrder.review.bookDetails")}
            </Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              {book.frontCoverImageUrl && (
                <img
                  src={book.frontCoverImageUrl}
                  alt={book.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <Typography variant="h6" className="mb-1">
                  {book.title}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {book.pageCount} {t("printOrder.pages")}
                </Typography>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Typography variant="small">
                  {t("printOrder.quantity")}:
                </Typography>
                <Typography variant="small" className="font-medium">
                  {orderData.quantity}
                </Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="small">
                  {t("printOrder.bookFormat")}:
                </Typography>
                <Typography variant="small" className="font-medium">
                  7.5" × 7.5" {t("printOrder.format.saddle")}
                </Typography>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <FaShippingFast className="h-6 w-6 text-green-600" />
            <Typography variant="h6">
              {t("printOrder.review.shippingDetails")}
            </Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="small" className="font-medium mb-2">
                {t("printOrder.shipping.address")}:
              </Typography>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{orderData.shippingAddress.name}</div>
                <div>{orderData.shippingAddress.street1}</div>
                {orderData.shippingAddress.street2 && (
                  <div>{orderData.shippingAddress.street2}</div>
                )}
                <div>
                  {orderData.shippingAddress.city},{" "}
                  {orderData.shippingAddress.state_code}{" "}
                  {orderData.shippingAddress.postcode}
                </div>
                <div>{orderData.shippingAddress.country_code}</div>
                <div>{orderData.shippingAddress.phone_number}</div>
                <div>{orderData.shippingAddress.email}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Typography variant="small" className="font-medium mb-1">
                  {t("printOrder.shipping.method")}:
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {getShippingMethodName(orderData.shippingLevel)}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="font-medium mb-1">
                  {t("printOrder.shipping.estimatedDelivery")}:
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {getShippingMethodEstimatedDays(orderData.shippingLevel)}
                </Typography>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <FaCreditCard className="h-6 w-6 text-purple-600" />
            <Typography variant="h6">
              {t("printOrder.review.costBreakdown")}
            </Typography>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Typography variant="small">
                {t("printOrder.printingCost")} ({orderData.quantity} ×{" "}
                {book.pageCount} {t("printOrder.pages")}):
              </Typography>
              <Typography variant="small">
                {formatPrice(
                  (() => {
                    // Calculate printing cost (line items + fulfillment)
                    const lineItemCost = parseFloat(
                      costData.cost_breakdown?.line_items?.[0]
                        ?.total_cost_incl_tax || 0
                    );
                    const fulfillmentCost = parseFloat(
                      costData.cost_breakdown?.fulfillment
                        ?.total_cost_incl_tax || 0
                    );
                    const basePrintingCost = lineItemCost + fulfillmentCost;

                    const baseShippingCost = parseFloat(
                      costData.cost_breakdown?.shipping?.total_cost_incl_tax ||
                        0
                    );
                    const totalBaseCost = basePrintingCost + baseShippingCost;
                    const finalTotalCost = parseFloat(
                      costData.total_cost_usd || 0
                    );

                    // Calculate proportional final costs
                    const printingProportion =
                      totalBaseCost > 0 ? basePrintingCost / totalBaseCost : 0;
                    const finalPrintingCost =
                      finalTotalCost * printingProportion;

                    return Math.ceil(finalPrintingCost / 0.01);
                  })()
                )}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="small">
                {t("printOrder.shippingCost")} (
                {getShippingMethodName(orderData.shippingLevel)}):
              </Typography>
              <Typography variant="small">
                {formatPrice(
                  (() => {
                    // Calculate shipping cost
                    const lineItemCost = parseFloat(
                      costData.cost_breakdown?.line_items?.[0]
                        ?.total_cost_incl_tax || 0
                    );
                    const fulfillmentCost = parseFloat(
                      costData.cost_breakdown?.fulfillment
                        ?.total_cost_incl_tax || 0
                    );
                    const basePrintingCost = lineItemCost + fulfillmentCost;

                    const baseShippingCost = parseFloat(
                      costData.cost_breakdown?.shipping?.total_cost_incl_tax ||
                        0
                    );
                    const totalBaseCost = basePrintingCost + baseShippingCost;
                    const finalTotalCost = parseFloat(
                      costData.total_cost_usd || 0
                    );

                    // Calculate proportional final costs
                    const shippingProportion =
                      totalBaseCost > 0 ? baseShippingCost / totalBaseCost : 0;
                    const finalShippingCost =
                      finalTotalCost * shippingProportion;

                    return Math.ceil(finalShippingCost / 0.01);
                  })()
                )}
              </Typography>
            </div>
            <hr />
            <div className="flex justify-between">
              <Typography variant="h6">{t("printOrder.total")}:</Typography>
              <Typography variant="h6" className="text-blue-600">
                {formatPrice(costData.total_cost_credits)}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Current Credit Balance */}
      <Card className={hasSufficientCredits ? "bg-green-50" : "bg-red-50"}>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="small" className="font-medium">
                {t("printOrder.review.currentBalance")}:
              </Typography>
              <Typography
                variant="h6"
                className={
                  hasSufficientCredits ? "text-green-600" : "text-red-600"
                }
              >
                {formatPrice(currentBalance)}
              </Typography>
            </div>
            {hasSufficientCredits && (
              <div className="text-right">
                <Typography variant="small" className="text-green-600">
                  {t("printOrder.review.balanceAfter")}:
                </Typography>
                <Typography
                  variant="small"
                  className="font-medium text-green-600"
                >
                  {formatPrice(currentBalance - costData.total_cost_credits)}
                </Typography>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-gray-50">
        <CardBody>
          <Typography variant="small" className="text-gray-600">
            {t("printOrder.review.terms")}
          </Typography>
        </CardBody>
      </Card>

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
          onClick={onSubmit}
          disabled={loading || !hasSufficientCredits}
          color={hasSufficientCredits ? "blue" : "gray"}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaCheckCircle className="h-4 w-4" />
          )}
          {loading ? t("printOrder.submitting") : t("printOrder.confirmOrder")}
        </Button>
      </div>
    </div>
  );
};

export default OrderReviewConfirmation;
