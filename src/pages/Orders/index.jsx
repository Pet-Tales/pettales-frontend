import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  Button,
  Spinner,
  Chip,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  FaBox,
  FaShippingFast,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";
import { toast } from "react-toastify";

import PrintOrderService from "@/services/printOrderService";
import logger from "@/utils/logger";

const OrdersPage = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Load orders and refresh statuses on initial mount
  useEffect(() => {
    const loadAndRefresh = async () => {
      await loadOrders();
      // After orders are loaded, refresh their statuses
      if (!refreshing) {
        setTimeout(() => {
          handleRefreshAllStatuses(false); // Don't show toast on automatic refresh
        }, 500);
      }
    };

    loadAndRefresh();
  }, []); // Only run on initial mount

  // Load orders when filters change (but don't auto-refresh statuses)
  useEffect(() => {
    if (statusFilter !== "" || pagination.page !== 1) {
      loadOrders();
    }
  }, [statusFilter, pagination.page]);

  // Load orders from API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await PrintOrderService.getUserPrintOrders(params);

      if (response.success) {
        setOrders(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logger.error("Failed to load orders:", error);
      toast.error(error.message || t("orders.errors.loadOrders"));
    } finally {
      setLoading(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t("orders.confirmCancel"))) {
      return;
    }

    try {
      const response = await PrintOrderService.cancelPrintOrder(orderId);

      if (response.success) {
        toast.success(t("orders.success.canceled"));
        loadOrders(); // Reload orders
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      logger.error("Failed to cancel order:", error);
      toast.error(error.message || t("orders.errors.cancelOrder"));
    }
  };

  // Refresh all order statuses
  const handleRefreshAllStatuses = async (showToastOnEmpty = true) => {
    try {
      setRefreshing(true);

      // Get all order IDs from current orders
      const orderIds = orders.map((order) => order._id);

      if (orderIds.length === 0) {
        if (showToastOnEmpty) {
          toast.info(t("orders.noOrdersToRefresh"));
        }
        return;
      }

      // Refresh status for each order
      const refreshPromises = orderIds.map(async (orderId) => {
        try {
          await PrintOrderService.getPrintOrderStatus(orderId);
        } catch (error) {
          logger.error(`Failed to refresh status for order ${orderId}:`, error);
          // Don't throw here, we want to continue with other orders
        }
      });

      await Promise.allSettled(refreshPromises);

      // Reload orders to get updated statuses
      await loadOrders();

      toast.success(t("orders.success.statusesRefreshed"));
    } catch (error) {
      logger.error("Failed to refresh order statuses:", error);
      toast.error(error.message || t("orders.errors.refreshStatuses"));
    } finally {
      setRefreshing(false);
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusConfig = {
      created: {
        color: "gray",
        icon: FaBox,
        label: t("orders.status.created"),
      },
      unpaid: {
        color: "orange",
        icon: FaExclamationTriangle,
        label: t("orders.status.unpaid"),
      },
      payment_in_progress: {
        color: "blue",
        icon: FaBox,
        label: t("orders.status.paymentInProgress"),
      },
      production_delayed: {
        color: "yellow",
        icon: FaBox,
        label: t("orders.status.productionDelayed"),
      },
      production_ready: {
        color: "blue",
        icon: FaBox,
        label: t("orders.status.productionReady"),
      },
      in_production: {
        color: "purple",
        icon: FaBox,
        label: t("orders.status.inProduction"),
      },
      shipped: {
        color: "green",
        icon: FaShippingFast,
        label: t("orders.status.shipped"),
      },
      rejected: {
        color: "red",
        icon: FaTimes,
        label: t("orders.status.rejected"),
      },
      canceled: {
        color: "gray",
        icon: FaTimes,
        label: t("orders.status.canceled"),
      },
    };

    return statusConfig[status] || statusConfig.created;
  };

  // Format price
  const formatPrice = (credits) => {
    const usd = (credits * 0.01).toFixed(2);
    return `${credits} ${t("common.credits")} ($${usd})`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if order can be canceled
  const canCancelOrder = (status) => {
    return ["created", "unpaid"].includes(status);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Typography variant="h4" className="text-gray-900">
            {t("orders.title")}
          </Typography>
          <Typography variant="small" className="text-gray-600">
            {t("orders.subtitle")}
          </Typography>
        </div>
        <Button
          variant="outlined"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleRefreshAllStatuses}
          disabled={refreshing || orders.length === 0}
        >
          {refreshing ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaSync className="h-4 w-4" />
          )}
          {t("orders.refreshAll")}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-4">
            <Typography variant="small" className="font-medium">
              {t("orders.filterByStatus")}:
            </Typography>
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                label={t("orders.allStatuses")}
              >
                <Option value="">{t("orders.allStatuses")}</Option>
                <Option value="created">{t("orders.status.created")}</Option>
                <Option value="unpaid">{t("orders.status.unpaid")}</Option>
                <Option value="in_production">
                  {t("orders.status.inProduction")}
                </Option>
                <Option value="shipped">{t("orders.status.shipped")}</Option>
                <Option value="rejected">{t("orders.status.rejected")}</Option>
                <Option value="canceled">{t("orders.status.canceled")}</Option>
              </Select>
            </div>
            {statusFilter && (
              <Button
                variant="text"
                size="sm"
                onClick={() => setStatusFilter("")}
              >
                {t("common.clear")}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FaBox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              {t("orders.noOrders")}
            </Typography>
            <Typography variant="small" className="text-gray-500 mb-4">
              {t("orders.noOrdersDescription")}
            </Typography>
            <Button onClick={() => navigate("/my-books")}>
              {t("orders.browseBooks")}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusDisplay = getStatusDisplay(order.status);
            const StatusIcon = statusDisplay.icon;

            return (
              <Card
                key={order._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Book Cover */}
                      {order.book_id?.front_cover_image_url && (
                        <img
                          src={order.book_id.front_cover_image_url}
                          alt={order.book_id.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}

                      {/* Order Details */}
                      <div>
                        <Typography variant="h6" className="mb-1">
                          {order.book_id?.title || t("orders.unknownBook")}
                        </Typography>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            {t("orders.orderNumber")}: {order.external_id}
                          </span>
                          <span>
                            {t("orders.quantity")}: {order.quantity}
                          </span>
                          <span>
                            {t("orders.total")}:{" "}
                            {formatPrice(order.total_cost_credits)}
                          </span>
                        </div>
                        <Typography
                          variant="small"
                          className="text-gray-500 mt-1"
                        >
                          {t("orders.ordered")}: {formatDate(order.created_at)}
                        </Typography>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Chip
                          icon={<StatusIcon className="h-4 w-4" />}
                          value={statusDisplay.label}
                          color={statusDisplay.color}
                          className="mb-2"
                        />
                        {order.tracking_info?.tracking_id && (
                          <Typography variant="small" className="text-gray-600">
                            {t("orders.tracking")}:{" "}
                            {order.tracking_info.tracking_id}
                          </Typography>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outlined"
                          className="flex items-center gap-2"
                          onClick={() => navigate(`/my-orders/${order._id}`)}
                        >
                          <FaEye className="h-4 w-4" />
                          {t("orders.viewDetails")}
                        </Button>
                        {canCancelOrder(order.status) && (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="red"
                            className="flex items-center gap-2"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            <FaTimes className="h-4 w-4" />
                            {t("orders.cancel")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              {t("common.previous")}
            </Button>
            <Typography variant="small" className="px-4">
              {t("common.pageOf", {
                current: pagination.page,
                total: pagination.pages,
              })}
            </Typography>
            <Button
              variant="outlined"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              {t("common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
