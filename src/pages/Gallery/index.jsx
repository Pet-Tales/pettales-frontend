import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Button,
  Input,
  Card,
  CardBody,
  CardFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { FaSearch, FaBook, FaUser, FaEye } from "react-icons/fa";
import GalleryService from "@/services/galleryService";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const Gallery = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const translateError = useErrorTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Load books when search query or search type changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBooks(true); // Reset books list
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

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
      loadBooks(false); // Append to existing books
    }
  }, [isLoading, isLoadingMore, pagination.hasNextPage, hasScrolledToBottom]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);



  const loadBooks = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setBooks([]);
        setPagination((prev) => ({ ...prev, currentPage: 1 }));
      } else {
        setIsLoadingMore(true);
      }

      const page = reset ? 1 : pagination.currentPage + 1;
      const response = await GalleryService.getPublicBooks(
        page,
        12,
        searchQuery,
        searchType
      );
      const { books: newBooks, pagination: newPagination } = response.data.data;

      if (reset) {
        setBooks(newBooks);
      } else {
        setBooks((prev) => [...prev, ...newBooks]);
      }

      setPagination(newPagination);
    } catch (error) {
      logger.error("Load books error:", error);
      const errorMessage = translateError(error?.data?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasScrolledToBottom(false);
    }
  };

  const handleBookView = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleUseAsTemplate = async (bookId) => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Redirect to login with redirect parameter pointing to book creation page
      // Include the bookId as a query parameter so we can load the template after auth
      const redirectPath = `/books/create?template=${bookId}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    try {
      const response = await GalleryService.getBookTemplate(bookId);
      const templateData = response.data.data.template;

      // Navigate to book creation page with template data
      navigate("/books/create", { state: { template: templateData } });
      toast.success(t("gallery.templateLoaded"));
    } catch (error) {
      logger.error("Load template error:", error);
      const errorMessage = translateError(error?.data?.message || error);
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "user":
        return t("gallery.searchByUser");
      case "title_description":
        return t("gallery.searchByTitle");
      default:
        return t("gallery.searchBooks");
    }
  };

  const BookCard = ({ book, showUseTemplate = false }) => (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="flex flex-col h-full">
        <div className="relative aspect-1-1-container rounded-t-lg !max-w-none">
          {book.frontCoverImageUrl ? (
            <img
              src={book.frontCoverImageUrl}
              alt={book.title}
              className="rounded-t-lg"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 rounded-t-lg bg-gray-100 flex items-center justify-center ${
              book.frontCoverImageUrl ? "hidden" : ""
            }`}
          >
            <FaBook className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <CardBody className="p-4 flex flex-col flex-grow">
          <Typography variant="h6" className="mb-2">
            {book.title}
          </Typography>
          <Typography
            variant="small"
            className="text-gray-600 mb-4 flex-grow line-clamp-3"
          >
            {book.description}
          </Typography>
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaUser className="h-3 w-3" />
                <span>
                  {book.userId?.firstName} {book.userId?.lastName}
                </span>
              </div>
              <span>{formatDate(book.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {book.pageCount} {t("books.pages")}
              </span>
              <span>{t(`books.styles.${book.illustrationStyle}`)}</span>
            </div>
          </div>
        </CardBody>

        <CardFooter className="pt-0 px-4 pb-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => handleBookView(book.id)}
            >
              <FaEye className="h-4 w-4" />
              {t("gallery.view")}
            </Button>
            {showUseTemplate && (
              <Button
                size="sm"
                variant="filled"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => handleUseAsTemplate(book.id)}
              >
                <FaBook className="h-4 w-4" />
                {t("gallery.useTemplate")}
              </Button>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );

  return (
    <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography variant="h2" className="text-gray-900 mb-4">
            {t("gallery.title")}
          </Typography>
          <Typography variant="lead" className="text-gray-600 mb-8">
            {t("gallery.description")}
          </Typography>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Type Selector */}
              <div className="w-full sm:w-48">
                <Select
                  value={searchType}
                  onChange={(value) => setSearchType(value)}
                  label={t("gallery.searchType.all")}
                >
                  <Option value="all">{t("gallery.searchType.all")}</Option>
                  <Option value="title_description">
                    {t("gallery.searchType.titleDescription")}
                  </Option>
                  <Option value="user">{t("gallery.searchType.user")}</Option>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex-1">
                <Input
                  icon={<FaSearch />}
                  label={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* All Books */}
        <div>
          <Typography variant="h4" className="text-gray-900 mb-6">
            {searchQuery ? t("gallery.searchResults") : t("gallery.allBooks")}
          </Typography>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} showUseTemplate={true} />
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
                {searchQuery
                  ? t("gallery.noSearchResults")
                  : t("gallery.noBooksAvailable")}
              </Typography>
              {searchQuery && (
                <Typography variant="small" className="text-gray-500 mb-6">
                  {t("gallery.tryDifferentSearch")}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
