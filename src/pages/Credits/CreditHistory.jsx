import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  IconButton,
} from "@material-tailwind/react";
import {
  FaCoins,
  FaPlus,
  FaMinus,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
  FaBook,
} from "react-icons/fa";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchCreditHistory, clearError } from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const CreditHistory = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();

  const { user } = useSelector((state) => state.auth);
  const {
    transactions,
    pagination,
    isFetchingHistory,
    error,
  } = useSelector((state) => state.credits);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = useCallback(
    (page = 1) => {
      dispatch(fetchCreditHistory({ page, limit: 20 }));
      setCurrentPage(page);
    },
    [dispatch]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  useEffect(() => {
    if (error) {
      const errorMessage = translateError(error);
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, translateError, dispatch]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "purchase":
        return <FaPlus className="text-green-500" />;
      case "usage":
        return <FaMinus className="text-red-500" />;
      case "refund":
        return <FaUndo className="text-blue-500" />;
      default:
        return <FaCoins className="text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "purchase":
        return "green";
      case "usage":
        return "red";
      case "refund":
        return "blue";
      default:
        return "gray";
    }
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return amount >= 0 ? `+${absAmount}` : `-${absAmount}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchHistory(page);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography variant="h2" className="text-gray-900 mb-4">
              {t("credits.historyTitle")}
            </Typography>
            <Typography variant="lead" className="text-gray-600">
              {t("credits.historySubtitle")}
            </Typography>
          </div>

          {/* Current Balance */}
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600">
            <CardBody className="text-center text-white">
              <FaCoins className="text-4xl mx-auto mb-4" />
              <Typography variant="h3" className="mb-2">
                {user?.creditsBalance?.toLocaleString() || 0}
              </Typography>
              <Typography variant="lead">
                {t("credits.currentBalance")}
              </Typography>
            </CardBody>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader className="bg-gray-50 p-4">
              <Typography variant="h5" className="text-gray-900">
                {t("credits.transactionHistory")}
              </Typography>
            </CardHeader>
            
            <CardBody className="p-0">
              {isFetchingHistory ? (
                <div className="text-center py-8">
                  <Typography variant="small" className="text-gray-600">
                    {t("credits.loadingHistory")}
                  </Typography>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FaCoins className="text-4xl text-gray-300 mx-auto mb-4" />
                  <Typography variant="h6" className="text-gray-500 mb-2">
                    {t("credits.noTransactions")}
                  </Typography>
                  <Typography variant="small" className="text-gray-400">
                    {t("credits.noTransactionsMessage")}
                  </Typography>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <Typography variant="small" className="font-medium text-gray-900">
                              {transaction.description}
                            </Typography>
                            
                            <div className="flex items-center space-x-2 mt-1">
                              <Chip
                                size="sm"
                                color={getTransactionColor(transaction.type)}
                                value={t(`credits.type.${transaction.type}`)}
                                className="text-xs"
                              />
                              
                              {transaction.book_id && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <FaBook className="mr-1" />
                                  <span>{transaction.book_id.title || t("credits.relatedBook")}</span>
                                </div>
                              )}
                            </div>
                            
                            <Typography variant="small" className="text-gray-500 mt-1">
                              {formatDate(transaction.created_at)}
                            </Typography>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Typography
                            variant="small"
                            className={`font-bold ${
                              transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatAmount(transaction.amount)} {t("credits.credits")}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Typography variant="small" className="text-gray-600">
                {t("credits.showingTransactions", {
                  start: (currentPage - 1) * 20 + 1,
                  end: Math.min(currentPage * 20, pagination.totalTransactions),
                  total: pagination.totalTransactions,
                })}
              </Typography>
              
              <div className="flex items-center space-x-2">
                <IconButton
                  variant="outlined"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage || isFetchingHistory}
                >
                  <FaChevronLeft className="h-3 w-3" />
                </IconButton>
                
                <Typography variant="small" className="text-gray-600">
                  {currentPage} / {pagination.totalPages}
                </Typography>
                
                <IconButton
                  variant="outlined"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || isFetchingHistory}
                >
                  <FaChevronRight className="h-3 w-3" />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreditHistory;
