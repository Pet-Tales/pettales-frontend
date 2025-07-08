import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Typography, Button, Select, Option } from "@material-tailwind/react";
import { FaFilter, FaPlus } from "react-icons/fa";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookCard from "@/components/Books/BookCard";
import {
  fetchBooks,
  setFilters,
  clearError,
  resetBooks,
  deleteBook,
  toggleBookPublic,
  retryBookGeneration,
} from "@/stores/reducers/books";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const MyBooks = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translateError = useErrorTranslation();

  const { books, pagination, isLoading, isLoadingMore, error, filters } =
    useSelector((state) => state.books);

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Load initial books
  useEffect(() => {
    dispatch(resetBooks());
    dispatch(
      fetchBooks({
        page: 1,
        limit: 12,
        status: filters.status,
        reset: true,
      })
    );
  }, [dispatch, filters.status]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch, translateError]);

  // Infinite scroll logic
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
      !isLoading &&
      !isLoadingMore &&
      pagination.hasNextPage &&
      !hasScrolledToBottom
    ) {
      setHasScrolledToBottom(true);
      dispatch(
        fetchBooks({
          page: pagination.currentPage + 1,
          limit: 12,
          status: filters.status,
          reset: false,
        })
      ).finally(() => {
        setHasScrolledToBottom(false);
      });
    }
  }, [
    isLoading,
    isLoadingMore,
    pagination.hasNextPage,
    pagination.currentPage,
    hasScrolledToBottom,
    dispatch,
    filters.status,
  ]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handle filter change
  const handleFilterChange = (value) => {
    dispatch(setFilters({ status: value || null }));
  };

  // Handle book deletion
  const handleBookDelete = async (bookId) => {
    try {
      await dispatch(deleteBook(bookId)).unwrap();
      toast.success(t("books.deleteSuccess"));
    } catch (error) {
      logger.error("Delete book error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  // Handle toggle public status
  const handleTogglePublic = async (bookId) => {
    try {
      const result = await dispatch(toggleBookPublic(bookId)).unwrap();
      const message = result.isPublic
        ? t("books.madePublicSuccess")
        : t("books.madePrivateSuccess");
      toast.success(message);
    } catch (error) {
      logger.error("Toggle book public error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  // Handle retry generation
  const handleRetryGeneration = async (bookId) => {
    try {
      await dispatch(retryBookGeneration(bookId)).unwrap();
      toast.success(t("books.retrySuccess"));
    } catch (error) {
      logger.error("Retry book generation error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <Typography variant="h2" className="text-gray-900 mb-2">
                {t("pages.myBooksPage")}
              </Typography>
              <Typography variant="lead" className="text-gray-600">
                {t("books.manageYourBooks")}
              </Typography>
            </div>
            <Button
              variant="gradient"
              className="flex items-center gap-2 mt-4 sm:mt-0"
              onClick={() => navigate("/books/create")}
            >
              <FaPlus className="h-4 w-4" />
              {t("books.createBook")}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center gap-2">
              <FaFilter className="h-4 w-4 text-gray-500" />
              <Typography variant="small" className="text-gray-700">
                {t("books.filterByStatus")}:
              </Typography>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filters.status || ""}
                onChange={handleFilterChange}
                label={t("books.allStatuses")}
              >
                <Option value="">{t("books.allStatuses")}</Option>
                <Option value="pending">{t("books.status.pending")}</Option>
                <Option value="generating">
                  {t("books.status.generating")}
                </Option>
                <Option value="completed">{t("books.status.completed")}</Option>
                <Option value="failed">{t("books.status.failed")}</Option>
              </Select>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onDelete={handleBookDelete}
                onTogglePublic={handleTogglePublic}
                onRetry={handleRetryGeneration}
              />
            ))}
          </div>

          {/* Loading States */}
          {isLoading && books.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {isLoadingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && books.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="h5" className="text-gray-600 mb-4">
                {filters.status
                  ? t("books.noBooksWithStatus", {
                      status: t(`books.status.${filters.status}`),
                    })
                  : t("books.noBooks")}
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-6">
                {t("books.createFirstBook")}
              </Typography>
              <Button
                variant="gradient"
                onClick={() => navigate("/books/create")}
              >
                {t("books.createBook")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyBooks;
