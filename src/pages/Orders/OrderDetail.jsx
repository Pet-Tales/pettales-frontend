import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Spinner,
  Chip,
  Alert,
} from "@material-tailwind/react";
import {
  FaArrowLeft,
  FaBox,
  FaShippingFast,
  FaTruck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaFileDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";

import PrintOrderService from "@/services/printOrderService";
import { smartNavigateBack } from "@/utils/navigationUtils";
import logger from "@/utils/logger";

const OrderDetail = () => {
  const { t } = useValidatedTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load order details on component mount
  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  // Load order details from API
  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await PrintOrderService.getPrintOrder(orderId);

      if (!response.success) {
        throw new Error(response.message);
      }

      setOrder(response.data);
    } catch (error) {
      logger.error("Failed to load order details:", error);
      toast.error(error.message || t("orderDetail.errors.loadOrder"));
      // Navigate back to orders list if order not found
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  };

  // Refresh order status from Lulu
  const handleRefreshStatus = async () => {
    try {
      setRefreshing(true);
      const response = await PrintOrderService.getPrintOrderStatus(orderId);

      if (response.success) {
        // Reload order details to get updated status
        await loadOrderDetails();
        toast.success(t("orderDetail.success.statusRefreshed"));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logger.error("Failed to refresh order status:", error);
      toast.error(error.message || t("orderDetail.errors.refreshStatus"));
    } finally {
      setRefreshing(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!window.confirm(t("orderDetail.confirmCancel"))) {
      return;
    }

    try {
      setCancelling(true);
      const response = await PrintOrderService.cancelPrintOrder(orderId);

      if (response.success) {
        toast.success(t("orderDetail.success.orderCancelled"));
        // Reload order details to show updated status
        await loadOrderDetails();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logger.error("Failed to cancel order:", error);
      toast.error(error.message || t("orderDetail.errors.cancelOrder"));
    } finally {
      setCancelling(false);
    }
  };

  // Get status display configuration
  const getStatusDisplay = (status) => {
    const statusMap = {
      created: {
        color: "blue",
        icon: FaBox,
        label: t("orderDetail.status.created"),
      },
      submitted: {
        color: "amber",
        icon: FaShippingFast,
        label: t("orderDetail.status.submitted"),
      },
      in_production: {
        color: "purple",
        icon: FaBox,
        label: t("orderDetail.status.inProduction"),
      },
      shipped: {
        color: "green",
        icon: FaTruck,
        label: t("orderDetail.status.shipped"),
      },
      delivered: {
        color: "green",
        icon: FaCheckCircle,
        label: t("orderDetail.status.delivered"),
      },
      cancelled: {
        color: "red",
        icon: FaTimes,
        label: t("orderDetail.status.cancelled"),
      },
      rejected: {
        color: "red",
        icon: FaExclamationTriangle,
        label: t("orderDetail.status.rejected"),
      },
    };

    return (
      statusMap[status] || {
        color: "gray",
        icon: FaBox,
        label: status,
      }
    );
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ["created", "submitted"].includes(status);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price
  const formatPrice = (credits) => {
    return `${credits} ${t("common.credits")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert color="red" icon={<FaExclamationTriangle />}>
          {t("orderDetail.errors.orderNotFound")}
        </Alert>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outlined"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => smartNavigateBack(navigate, "/my-orders")}
        >
          <FaArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <div>
          <Typography variant="h4" className="mb-1">
            {t("orderDetail.title")}
          </Typography>
          <Typography variant="small" className="text-gray-600">
            {t("orderDetail.orderNumber")}: {order.external_id}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6">
                  {t("orderDetail.orderStatus")}
                </Typography>
                <Button
                  size="sm"
                  variant="outlined"
                  className="flex items-center gap-2"
                  onClick={handleRefreshStatus}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <FaBox className="h-4 w-4" />
                  )}
                  {t("orderDetail.refreshStatus")}
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <StatusIcon className="h-6 w-6" />
                <Chip
                  value={statusDisplay.label}
                  color={statusDisplay.color}
                  className="capitalize"
                />
              </div>

              {order.error_message && (
                <Alert color="red" className="mb-4">
                  {order.error_message}
                </Alert>
              )}

              {/* Order Actions */}
              <div className="flex gap-2">
                {canCancelOrder(order.status) && (
                  <Button
                    color="red"
                    variant="outlined"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <FaTimes className="h-4 w-4" />
                    )}
                    {t("orderDetail.cancelOrder")}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Book Information */}
          <Card>
            <CardBody>
              <Typography variant="h6" className="mb-4">
                {t("orderDetail.bookInformation")}
              </Typography>

              <div className="flex items-start gap-4">
                {order.book_id?.front_cover_image_url && (
                  <img
                    src={order.book_id.front_cover_image_url}
                    alt={order.book_id.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <Typography variant="h6" className="mb-2">
                    {order.book_id?.title || t("orderDetail.unknownBook")}
                  </Typography>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaBox className="h-4 w-4" />
                      <span>
                        {t("orderDetail.quantity")}: {order.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaFileDownload className="h-4 w-4" />
                      <span>
                        {t("orderDetail.pages")}:{" "}
                        {order.book_id?.page_count ||
                          order.book_id?.pageCount ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardBody>
              <Typography variant="h6" className="mb-4">
                {t("orderDetail.orderSummary")}
              </Typography>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t("orderDetail.totalCredits")}:
                  </span>
                  <span className="font-semibold">
                    {formatPrice(order.total_cost_credits)}
                  </span>
                </div>
                <hr />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendarAlt className="h-4 w-4" />
                  <span>
                    {t("orderDetail.ordered")}: {formatDate(order.created_at)}
                  </span>
                </div>
                {order.shipped_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaTruck className="h-4 w-4" />
                    <span>
                      {t("orderDetail.shipped")}: {formatDate(order.shipped_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardBody>
              <Typography variant="h6" className="mb-4">
                {t("orderDetail.shippingInformation")}
              </Typography>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="h-4 w-4 mt-1 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {order.shipping_address?.name}
                    </div>
                    <div className="text-gray-600">
                      {order.shipping_address?.street1}
                      {order.shipping_address?.street2 && (
                        <div>{order.shipping_address.street2}</div>
                      )}
                      <div>
                        {order.shipping_address?.city},{" "}
                        {order.shipping_address?.state_code}{" "}
                        {order.shipping_address?.postcode}
                      </div>
                      <div>{order.shipping_address?.country_code}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FaShippingFast className="h-4 w-4 text-gray-600" />
                  <span>
                    {t("orderDetail.shippingMethod")}: {order.shipping_level}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tracking Information */}
          {order.tracking_info &&
            (order.tracking_info.tracking_id ||
              order.tracking_info.carrier_name ||
              (order.tracking_info.tracking_urls &&
                order.tracking_info.tracking_urls.length > 0)) && (
              <Card>
                <CardBody>
                  <Typography variant="h6" className="mb-4">
                    {t("orderDetail.trackingInformation")}
                  </Typography>

                  <div className="space-y-3">
                    {order.tracking_info?.tracking_id ? (
                      <div className="flex items-center gap-2 text-sm">
                        <FaTruck className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">
                          {t("orderDetail.trackingNumber")}:
                        </span>
                        <span className="font-mono">
                          {order.tracking_info.tracking_id}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaTruck className="h-4 w-4" />
                        <span>{t("orderDetail.trackingNotAvailable")}</span>
                      </div>
                    )}

                    {order.tracking_info?.carrier_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <FaBox className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">
                          {t("orderDetail.carrier")}:
                        </span>
                        <span>{order.tracking_info.carrier_name}</span>
                      </div>
                    )}

                    {order.tracking_info?.tracking_urls &&
                      order.tracking_info.tracking_urls.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            {t("orderDetail.trackingLinks")}:
                          </div>
                          {order.tracking_info.tracking_urls.map(
                            (url, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outlined"
                                className="flex items-center gap-2 w-full justify-start"
                                onClick={() => window.open(url, "_blank")}
                              >
                                <FaExternalLinkAlt className="h-3 w-3" />
                                {t("orderDetail.trackPackage")}
                              </Button>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </CardBody>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
