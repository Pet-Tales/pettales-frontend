import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import {
  FaEllipsisV,
  FaEye,
  FaTrash,
  FaDownload,
  FaGlobe,
  FaLock,
  FaRedo,
  FaBook,
} from "react-icons/fa";
import BookStatusBadge from "./BookStatusBadge";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import {
  downloadBookPDF,
  generateBookPdfFilename,
} from "@/utils/downloadUtils";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const BookCard = ({
  book,
  onDelete,
  onTogglePublic,
  onRetry,
  isOwner = true,
}) => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/books/${book.id}`);
  };

  // Handle PDF download
  const handleDownloadPDF = async (event) => {
    event.stopPropagation();
    try {
      if (!book.pdfUrl) {
        toast.error(t("books.noPdfAvailable"));
        return;
      }

      const filename = generateBookPdfFilename(book);
      const result = await downloadBookPDF(book.id, filename, null, true); // Show save dialog

      if (result.requiresPayment) {
        if (result.isGuest) {
          // Guest user - redirect to Stripe checkout
          window.location.href = result.checkoutUrl;
        } else {
          // This shouldn't happen as authenticated users get different handling
          toast.error(result.message || t("books.paymentRequired"));
        }
      }
    } catch (error) {
      logger.error("PDF download error:", error);

      // Handle user cancellation
      if (error.message === "Download cancelled by user") {
        // Don't show error message for user cancellation
        return;
      }

      // Handle insufficient credits error
      if (
        error.status === 402 &&
        error.data?.error === "INSUFFICIENT_CREDITS"
      ) {
        const { required, available, shortfall } = error.data.data;
        toast.error(
          `${t("books.insufficientCredits")} ${t(
            "books.creditsRequired"
          )}: ${required}, ${t("books.creditsAvailable")}: ${available}, ${t(
            "books.creditsShortfall"
          )}: ${shortfall}`
        );
        return;
      }

      const errorMessage = error.message || t("books.downloadFailed");
      toast.error(errorMessage);
    }
  };

  const handleMenuAction = (action, event) => {
    event.stopPropagation();
    setIsMenuOpen(false);

    switch (action) {
      case "view":
        navigate(`/books/${book.id}`);
        break;
      case "delete":
        setShowDeleteModal(true);
        break;
      case "download":
        handleDownloadPDF(event);
        break;
      case "toggle-public":
        onTogglePublic?.(book.id);
        break;
      case "retry":
        onRetry?.(book.id);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.(book.id);
    setShowDeleteModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canDownload = book.generationStatus === "completed" && book.pdfUrl;
  const canTogglePublic = book.generationStatus === "completed";
  const canRetry = book.generationStatus === "failed";

  return (
    <>
      <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
        <div onClick={handleCardClick} className="flex flex-col h-full">
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
            <div className="absolute top-2 left-2">
              <BookStatusBadge status={book.generationStatus} />
            </div>
            <div className="absolute top-2 right-2">
              <Menu
                open={isMenuOpen}
                handler={setIsMenuOpen}
                placement="bottom-end"
              >
                <MenuHandler>
                  <IconButton
                    variant="text"
                    className="bg-white/80 hover:bg-white"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEllipsisV className="h-4 w-4" />
                  </IconButton>
                </MenuHandler>
                <MenuList className="min-w-[120px]">
                  <MenuItem
                    className="flex items-center gap-2"
                    onClick={(e) => handleMenuAction("view", e)}
                  >
                    <FaEye className="h-4 w-4" />
                    {t("books.view")}
                  </MenuItem>
                  {canDownload && (
                    <MenuItem
                      className="flex items-center gap-2"
                      onClick={(e) => handleMenuAction("download", e)}
                    >
                      <FaDownload className="h-4 w-4" />
                      {t("books.download")}
                    </MenuItem>
                  )}
                  {canTogglePublic && (
                    <MenuItem
                      className="flex items-center gap-2"
                      onClick={(e) => handleMenuAction("toggle-public", e)}
                    >
                      {book.isPublic ? (
                        <>
                          <FaLock className="h-4 w-4" />
                          {t("books.makePrivate")}
                        </>
                      ) : (
                        <>
                          <FaGlobe className="h-4 w-4" />
                          {t("books.makePublic")}
                        </>
                      )}
                    </MenuItem>
                  )}
                  {canRetry && (
                    <MenuItem
                      className="flex items-center gap-2"
                      onClick={(e) => handleMenuAction("retry", e)}
                    >
                      <FaRedo className="h-4 w-4" />
                      {t("books.retry")}
                    </MenuItem>
                  )}
                  <hr className="my-1" />
                  <MenuItem
                    className="flex items-center gap-2 text-red-500"
                    onClick={(e) => handleMenuAction("delete", e)}
                  >
                    <FaTrash className="h-4 w-4" />
                    {t("books.delete")}
                  </MenuItem>
                </MenuList>
              </Menu>
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
            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <span>{formatDate(book.createdAt)}</span>
              <div className="flex items-center gap-2">
                <span>
                  {book.pageCount} {t("books.pages")}
                </span>
                <span>•</span>
                <span>{t(`books.styles.${book.illustrationStyle}`)}</span>
              </div>
            </div>
          </CardBody>
        </div>

        {book.generationStatus === "completed" && (
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outlined"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/books/${book.id}`);
                }}
              >
                {t("books.view")}
              </Button>
              {canDownload && (
                <Button
                  size="sm"
                  variant="filled"
                  className="flex-1"
                  onClick={handleDownloadPDF}
                >
                  {isOwner ? t("books.download") : t("books.downloadPaid")}
                </Button>
              )}
            </div>
          </CardFooter>
        )}

        {book.generationStatus === "failed" && (
          <CardFooter className="pt-0 px-4 pb-4">
            <Button
              size="sm"
              variant="filled"
              color="red"
              className="w-full flex justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.(book.id);
              }}
            >
              <FaRedo className="h-4 w-4 mr-2" />
              {t("books.retry")}
            </Button>
          </CardFooter>
        )}
      </Card>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        bookTitle={book.title}
      />
    </>
  );
};

export default BookCard;
