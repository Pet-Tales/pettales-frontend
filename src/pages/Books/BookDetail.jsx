import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Button,
  Card,
  CardBody,
  IconButton,
} from "@material-tailwind/react";
import {
  FaArrowLeft,
  FaEdit,
  FaDownload,
  FaGlobe,
  FaLock,
  FaTrash,
  FaRedo,
  FaChild,
  FaDog,
  FaSync,
  FaCopy,
  FaPrint,
  FaCheckCircle,
} from "react-icons/fa";

import BookStatusBadge from "@/components/Books/BookStatusBadge";
import DeleteConfirmationModal from "@/components/Books/DeleteConfirmationModal";
import PageEditor from "@/components/Books/PageEditor";
import IllustrationSelector from "@/components/Books/IllustrationSelector";
import RegenerationCounter from "@/components/Books/RegenerationCounter";
import IllustrationService from "@/services/illustrationService";
import {
  fetchBookById,
  updateBook,
  toggleBookPublic,
  deleteBook,
  retryBookGeneration,
  clearCurrentBook,
  setPdfNeedsRegeneration,
} from "@/stores/reducers/books";
import { updateCreditsBalance } from "@/stores/reducers/auth";
import { fetchCreditBalance } from "@/stores/reducers/credits";
import BookService from "@/services/bookService";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";
import { API_BASE_URL } from "@/utils/constants";
import { smartNavigateBack, getFallbackPath } from "@/utils/navigationUtils";
import {
  downloadBookPDF,
  generateBookPdfFilename,
} from "@/utils/downloadUtils";
import CharitySelectionModal from "@/components/Books/CharitySelectionModal";

// --- pricing helpers (amounts in minor units: pence/cents) ---
const DOWNLOAD_PRICE_BY_PAGES = {
  gbp: { 12: 799, 16: 899, 24: 1099 }, // £7.99, £8.99, £10.99   <-- set your actuals
  usd: { 12: 899, 16: 999, 24: 1299 }, // $8.99, $9.99, $12.99   <-- set your actuals
};

function detectCurrency() {
  try {
    const lang = (navigator.language || "").toLowerCase();
    return lang.includes("gb") || lang.includes("en-gb") ? "gbp" : "usd";
  } catch { return "usd"; }
}

function formatMoney(minor, currency) {
  const map = { gbp: "GBP", usd: "USD" };
  return new Intl.NumberFormat(undefined, { style: "currency", currency: map[currency] || "USD" })
    .format((minor || 0) / 100);
}

function downloadPriceFor(pageCount, currency) {
  const table = DOWNLOAD_PRICE_BY_PAGES[currency] || {};
  return table[pageCount] ?? table[24] ?? 0;
}
// --- end helpers ---

const BookDetail = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const translateError = useErrorTranslation();

  const { currentBook, isLoading } = useSelector((state) => state.books);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const currency = detectCurrency();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [bookPages, setBookPages] = useState([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [showFrontCoverSelector, setShowFrontCoverSelector] = useState(false);
  const [showBackCoverSelector, setShowBackCoverSelector] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  // Regeneration states
  const [isRegeneratingFrontCover, setIsRegeneratingFrontCover] =
    useState(false);
  const [isRegeneratingBackCover, setIsRegeneratingBackCover] = useState(false);

  // PDF regeneration states
  const [isRegeneratingPDF, setIsRegeneratingPDF] = useState(false);

  // Payment success download trigger
  const [pendingPaymentDownload, setPendingPaymentDownload] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  // Load book data
  useEffect(() => {
    if (id) {
      dispatch(fetchBookById(id));
    }
    return () => {
      dispatch(clearCurrentBook());
    };
  }, [dispatch, id]);

  // Load book pages when book is loaded
  useEffect(() => {
    if (currentBook && currentBook.generationStatus === "completed") {
      loadBookPages();
    }
  }, [currentBook]);

  // Handle payment success URL parameters
  useEffect(() => {
    const payment = searchParams.get("payment");
    const download = searchParams.get("download");
    const sessionId = searchParams.get("session_id");

    // Handle payment cancellation immediately
    if (payment === "cancelled") {
      setSearchParams({});
      toast.info(t("books.paymentCancelled"));
      return;
    }

    // Handle payment success - set flag to trigger download when book loads
    if (payment === "success" && download === "pdf" && sessionId) {
      logger.info(
        "Payment success detected, will trigger download when book loads"
      );
      setSearchParams({});
      setPendingPaymentDownload(true);
      setPaymentSessionId(sessionId);
    }
  }, [searchParams, setSearchParams, t]);

  // Show payment success modal when book is loaded and payment was successful
  useEffect(() => {
    if (pendingPaymentDownload && currentBook && currentBook.pdfUrl) {
      logger.info(
        "Book loaded after payment success, showing download modal for book:",
        currentBook.id
      );

      setPendingPaymentDownload(false);
      setShowPaymentSuccessModal(true);

      // Show success message
      toast.success(t("books.paymentSuccessful"));
    }
  }, [
    pendingPaymentDownload,
    currentBook,
    paymentSessionId,
    setPendingPaymentDownload,
    t,
  ]);

  const loadBookPages = async () => {
    try {
      setIsLoadingPages(true);
      const response = await BookService.getBookPages(id, true); // grouped = true
      setBookPages(response.data.data.pages);
    } catch (error) {
      logger.error("Load book pages error:", error);
      const errorMessage = translateError(error?.data?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      const result = await dispatch(toggleBookPublic(id)).unwrap();
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

  const handleDelete = async () => {
    try {
      await dispatch(deleteBook(id)).unwrap();
      toast.success(t("books.deleteSuccess"));
      navigate("/my-books");
    } catch (error) {
      logger.error("Delete book error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  const handleUseAsTemplate = () => {
    // Navigate to book creation page with template parameter
    navigate(`/books/create?template=${id}`);
  };

  const handlePrintOrder = () => {
    // Navigate to print order page
    navigate(`/books/${id}/print-order`);
  };

  const handleRetry = async () => {
    try {
      await dispatch(retryBookGeneration(id)).unwrap();
      toast.success(t("books.retrySuccess"));
    } catch (error) {
      logger.error("Retry book generation error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  const handlePageEdit = (page) => {
    setSelectedPage(page);
    setShowPageEditor(true);
  };

  const handlePageUpdateSuccess = async () => {
    setShowPageEditor(false);
    setSelectedPage(null);

    // Set PDF regeneration flag immediately since page content was edited
    dispatch(setPdfNeedsRegeneration({ bookId: id, needsRegeneration: true }));

    loadBookPages(); // Reload pages to get updated data

    // Refresh book data to get updated regeneration count and credit balance
    dispatch(fetchBookById(id));
  };

  const handleFrontCoverSelect = async (selectedUrl) => {
    try {
      setIsUpdatingCover(true);

      // Set PDF regeneration flag immediately
      dispatch(
        setPdfNeedsRegeneration({ bookId: id, needsRegeneration: true })
      );

      await dispatch(
        updateBook({
          bookId: id,
          updateData: { front_cover_image_url: selectedUrl },
        })
      ).unwrap();
      toast.success(t("books.coverUpdateSuccess"));
    } catch (error) {
      logger.error("Update front cover error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsUpdatingCover(false);
    }
  };

  const handleBackCoverSelect = async (selectedUrl) => {
    try {
      setIsUpdatingCover(true);

      // Set PDF regeneration flag immediately
      dispatch(
        setPdfNeedsRegeneration({ bookId: id, needsRegeneration: true })
      );

      await dispatch(
        updateBook({
          bookId: id,
          updateData: { back_cover_image_url: selectedUrl },
        })
      ).unwrap();
      toast.success(t("books.coverUpdateSuccess"));
    } catch (error) {
      logger.error("Update back cover error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsUpdatingCover(false);
    }
  };

  // Regeneration functions
  const handleRegenerateFrontCover = async () => {
    try {
      setIsRegeneratingFrontCover(true);

      // Set PDF regeneration flag immediately
      dispatch(
        setPdfNeedsRegeneration({ bookId: id, needsRegeneration: true })
      );

      const response = await IllustrationService.regenerateFrontCover(id);
      const newImageUrl = response.data?.newImageUrl;

      // Update credit balance if credits were used
      if (response.data?.creditsUsed > 0) {
        dispatch(
          updateCreditsBalance(user.creditsBalance - response.data.creditsUsed)
        );
      }

      if (newImageUrl) {
        // Automatically set the new image as the main front cover
        await dispatch(
          updateBook({
            bookId: id,
            updateData: { front_cover_image_url: newImageUrl },
          })
        ).unwrap();
      }

      // Refresh book data to get updated alternatives and regeneration count
      dispatch(fetchBookById(id));

      // Refresh credit balance to ensure navbar is updated
      dispatch(fetchCreditBalance());

      toast.success(t("books.regenerateSuccess"));
    } catch (error) {
      logger.error("Regenerate front cover error:", error);

      // Re-throw the error so IllustrationSelector can handle it
      throw error;
    } finally {
      setIsRegeneratingFrontCover(false);
    }
  };

  const handleRegenerateBackCover = async () => {
    try {
      setIsRegeneratingBackCover(true);

      // Set PDF regeneration flag immediately
      dispatch(
        setPdfNeedsRegeneration({ bookId: id, needsRegeneration: true })
      );

      const response = await IllustrationService.regenerateBackCover(id);
      const newImageUrl = response.data?.newImageUrl;

      // Update credit balance if credits were used
      if (response.data?.creditsUsed > 0) {
        dispatch(
          updateCreditsBalance(user.creditsBalance - response.data.creditsUsed)
        );
      }

      if (newImageUrl) {
        // Automatically set the new image as the main back cover
        await dispatch(
          updateBook({
            bookId: id,
            updateData: { back_cover_image_url: newImageUrl },
          })
        ).unwrap();
      }

      // Refresh book data to get updated alternatives and regeneration count
      dispatch(fetchBookById(id));

      // Refresh credit balance to ensure navbar is updated
      dispatch(fetchCreditBalance());

      toast.success(t("books.regenerateSuccess"));
    } catch (error) {
      logger.error("Regenerate back cover error:", error);

      // Re-throw the error so IllustrationSelector can handle it
      throw error;
    } finally {
      setIsRegeneratingBackCover(false);
    }
  };

  // PDF regeneration function
  const handleRegeneratePDF = async () => {
    try {
      setIsRegeneratingPDF(true);
      await BookService.regeneratePDF(id);

      // Update the book's PDF URL and flag in the Redux store
      await dispatch(fetchBookById(id));

      toast.success(t("books.pdfRegenerateSuccess"));
    } catch (error) {
      logger.error("Regenerate PDF error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsRegeneratingPDF(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle PDF download
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [pendingCheckoutCharityId, setPendingCheckoutCharityId] =
    useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      if (!currentBook?.pdfUrl) {
        toast.error(t("books.noPdfAvailable"));
        return;
      }

      const filename = generateBookPdfFilename(currentBook);
      const result = await downloadBookPDF(
        currentBook.id,
        filename,
        null,
        true,
        null
      ); // Show save dialog

      if (result.requiresPayment) {
        if (result.charityRequired) {
          setShowCharityModal(true);
          return;
        }
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      logger.error("PDF download error:", error);

      if (error.message === "Download cancelled by user") {
        return;
      }

      const errorMessage = error.message || t("books.downloadFailed");
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCharityConfirm = async (charityId) => {
    try {
      setPendingCheckoutCharityId(charityId);
      setShowCharityModal(false);
      const filename = generateBookPdfFilename(currentBook);
      const result = await downloadBookPDF(
        currentBook.id,
        filename,
        null,
        true,
        charityId
      );
      if (result.requiresPayment && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      logger.error("Charity selection checkout failed:", error);
      toast.error(t("charity.checkoutFailed"));
    }
  };

  // Handle post-payment PDF download from modal (with session ID)
  const handlePaymentSuccessDownload = async () => {
    try {
      if (!currentBook?.pdfUrl) {
        toast.error(t("books.noPdfAvailable"));
        return;
      }

      const filename = generateBookPdfFilename(currentBook);
      logger.info("Starting post-payment PDF download:", filename);

      // First, try to get the file handle while we still have user gesture context
      let fileHandle = null;
      if ("showSaveFilePicker" in window) {
        try {
          fileHandle = await window.showSaveFilePicker({
            suggestedName: filename || "book.pdf",
            types: [
              {
                description: "PDF files",
                accept: {
                  "application/pdf": [".pdf"],
                },
              },
            ],
          });
        } catch (fsError) {
          if (fsError.name === "AbortError") {
            // User cancelled the save dialog
            setShowPaymentSuccessModal(false);
            setPaymentSessionId(null);
            return;
          }
          // If File System Access API fails, we'll fall back to regular download
          console.warn(
            "File System Access API failed, will use fallback:",
            fsError
          );
        }
      }

      // Now fetch the PDF
      const baseUrl = API_BASE_URL || "http://127.0.0.1:3000";
      let url = `${baseUrl}/api/books/${currentBook.id}/download-pdf`;
      if (paymentSessionId) {
        url += `?session_id=${encodeURIComponent(paymentSessionId)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // If we have a file handle, use it
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();

        logger.info(
          "Post-payment PDF download completed successfully with native save dialog"
        );
        setShowPaymentSuccessModal(false);
        setPaymentSessionId(null);
        return;
      }

      // Fallback to regular download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "book.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      logger.info(
        "Post-payment PDF download completed successfully with fallback method"
      );
      setShowPaymentSuccessModal(false);
      setPaymentSessionId(null);
    } catch (error) {
      logger.error("Post-payment PDF download error:", error);
      toast.error(t("books.downloadFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Typography variant="h5" className="text-gray-600">
          {t("books.notFound")}
        </Typography>
      </div>
    );
  }

  // Use the backend's isOwner field which handles ownership correctly
  const isOwner = isAuthenticated && currentBook && currentBook.isOwner;

  const canEditPages =
    currentBook && currentBook.generationStatus === "completed" && isOwner;
  const canDownload =
    currentBook &&
    currentBook.generationStatus === "completed" &&
    currentBook.pdfUrl;
  const canTogglePublic =
    currentBook && currentBook.generationStatus === "completed" && isOwner;
  const canRetry =
    currentBook && currentBook.generationStatus === "failed" && isOwner;
  const canDelete = isOwner;
  const canUseAsTemplate =
    currentBook && currentBook.generationStatus === "completed";
  const canPrintOrder =
    currentBook && currentBook.generationStatus === "completed" && isOwner;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="text"
                className="flex items-center gap-2"
                onClick={() => {
                  const fallbackPath = getFallbackPath(
                    isAuthenticated,
                    window.location.pathname
                  );
                  smartNavigateBack(navigate, fallbackPath, isAuthenticated);
                }}
              >
                <FaArrowLeft className="h-4 w-4" />
                {t("common.back")}
              </Button>
              <div>
                <Typography variant="h4" className="text-gray-900">
                  {currentBook.title}
                </Typography>
                <div className="flex items-center gap-2 mt-1">
                  <BookStatusBadge status={currentBook.generationStatus} />
                  <Typography variant="small" className="text-gray-600">
                    {t("books.createdOn")} {formatDate(currentBook.createdAt)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {canDownload && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                >
                  <FaDownload className="h-4 w-4" />
                  {isDownloading
                  {isDownloading
  ? t("books.downloading")
  : `Download (${formatMoney(downloadPriceFor(currentBook.pageCount, currency), currency)})`}
                </Button>
              )}
              {canUseAsTemplate && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleUseAsTemplate}
                >
                  <FaCopy className="h-4 w-4" />
                  {t("books.useAsTemplate")}
                </Button>
              )}
              {canPrintOrder && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handlePrintOrder}
                >
                  <FaPrint className="h-4 w-4" />
                  {t("books.printOrder")}
                </Button>
              )}
              {canDownload && isOwner && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleRegeneratePDF}
                  disabled={
                    !currentBook?.pdfNeedsRegeneration || isRegeneratingPDF
                  }
                >
                  {isRegeneratingPDF ? (
                    <FaSync className="h-4 w-4 animate-spin" />
                  ) : (
                    <FaSync className="h-4 w-4" />
                  )}
                  {isRegeneratingPDF
                    ? t("books.regeneratingPDF")
                    : t("books.regeneratePDF")}
                </Button>
              )}
              {canTogglePublic && (
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleTogglePublic}
                >
                  {currentBook.isPublic ? (
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
                </Button>
              )}
              {canRetry && (
                <Button
                  variant="filled"
                  color="red"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleRetry}
                >
                  <FaRedo className="h-4 w-4" />
                  {t("books.retry")}
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outlined"
                  color="red"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrash className="h-4 w-4" />
                  {t("books.delete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h6">{t("books.bookDetails")}</Typography>
                </div>

                <div className="space-y-4">
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      {t("books.description")}
                    </Typography>
                    <Typography>{currentBook.description}</Typography>
                  </div>
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      {t("books.moral")}
                    </Typography>
                    <Typography>{currentBook.moral}</Typography>
                  </div>
                  {currentBook.dedication && (
                    <div>
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-1"
                      >
                        {t("books.dedication")}
                      </Typography>
                      <Typography>{currentBook.dedication}</Typography>
                    </div>
                  )}
                  {currentBook.moralOfBackCover && (
                    <div>
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-1"
                      >
                        {t("books.backCoverMoral")}
                      </Typography>
                      <Typography>{currentBook.moralOfBackCover}</Typography>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        {t("books.language")}
                      </Typography>
                      <Typography variant="small" className="font-medium">
                        {t(`languages.${currentBook.language}`)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        {t("books.pageCount")}
                      </Typography>
                      <Typography variant="small" className="font-medium">
                        {currentBook.pageCount} {t("books.pages")}
                      </Typography>
                    </div>

                    {/* Regeneration Counter */}
                    {isOwner && (
                      <div>
                        <RegenerationCounter
                          pageCount={currentBook.pageCount}
                          regenerationsUsed={currentBook.regenerationsUsed || 0}
                          showLabel={true}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        {t("books.illustrationStyle")}
                      </Typography>
                      <Typography variant="small" className="font-medium">
                        {t(`books.styles.${currentBook.illustrationStyle}`)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        {t("books.visibility")}
                      </Typography>
                      <Typography variant="small" className="font-medium">
                        {currentBook.isPublic
                          ? t("books.public")
                          : t("books.private")}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Characters - Only visible to book owner */}
            {isOwner &&
              currentBook.characterIds &&
              currentBook.characterIds.length > 0 && (
                <Card>
                  <CardBody>
                    <Typography variant="h6" className="mb-4">
                      {t("books.characters")}
                    </Typography>
                    <div className="space-y-3">
                      {[...currentBook.characterIds]
                        .filter(
                          (character) =>
                            character &&
                            character.characterName &&
                            character.characterType
                        )
                        .sort((a, b) => {
                          // Sort by character type first (human before pet), then alphabetically by name
                          if (a.characterType !== b.characterType) {
                            return a.characterType === "human" ? -1 : 1;
                          }
                          return a.characterName.localeCompare(b.characterName);
                        })
                        .map((character) => (
                          <div
                            key={character.id}
                            className="flex items-center gap-3"
                          >
                            {/* Character Image/Avatar */}
                            {character.referenceImageUrl ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                  src={character.referenceImageUrl}
                                  alt={character.characterName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                {character.characterType === "pet" ? (
                                  <FaDog className="h-6 w-6 text-gray-600" />
                                ) : (
                                  <FaChild className="h-6 w-6 text-gray-600" />
                                )}
                              </div>
                            )}
                            <div>
                              <Typography
                                variant="small"
                                className="font-medium"
                              >
                                {character.characterName}
                              </Typography>
                              <Typography
                                variant="small"
                                className="text-gray-600"
                              >
                                {t(`characters.${character.characterType}`)}
                              </Typography>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              )}
          </div>

          {/* Right Side - Book Content */}
          <div style={{ contain: "size" }}>
            <Card className="h-full overflow-hidden">
              <CardBody className="flex overflow-hidden h-full flex-col">
                <Typography variant="h6" className="mb-4">
                  {t("books.bookContent")}
                </Typography>

                {currentBook.generationStatus === "completed" ? (
                  <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
                    {/* Cover Images */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentBook.frontCoverImageUrl && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Typography
                              variant="small"
                              className="text-gray-600"
                            >
                              {t("books.frontCover")}
                            </Typography>
                            {isOwner &&
                              currentBook.alternativeFrontCovers &&
                              currentBook.alternativeFrontCovers.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="text"
                                  className="text-xs"
                                  onClick={() =>
                                    setShowFrontCoverSelector(true)
                                  }
                                >
                                  {t("books.changeCover")}
                                </Button>
                              )}
                          </div>
                          <div className="aspect-1-1-container rounded-lg">
                            <img
                              src={currentBook.frontCoverImageUrl}
                              alt={t("books.frontCoverAlt")}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      {currentBook.backCoverImageUrl && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Typography
                              variant="small"
                              className="text-gray-600"
                            >
                              {t("books.backCover")}
                            </Typography>
                            {isOwner &&
                              currentBook.alternativeBackCovers &&
                              currentBook.alternativeBackCovers.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="text"
                                  className="text-xs"
                                  onClick={() => setShowBackCoverSelector(true)}
                                >
                                  {t("books.changeCover")}
                                </Button>
                              )}
                          </div>
                          <div className="aspect-1-1-container rounded-lg">
                            <img
                              src={currentBook.backCoverImageUrl}
                              alt={t("books.backCoverAlt")}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Pages */}
                    {isLoadingPages ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : bookPages.length > 0 ? (
                      <div className="space-y-4 flex-col flex flex-1 overflow-hidden">
                        <Typography variant="small" className="text-gray-600">
                          {t("books.storyPages")}
                        </Typography>
                        <div className="overflow-y-auto space-y-4">
                          {bookPages.map((pageGroup) => (
                            <div
                              key={pageGroup.storyPageNumber}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                canEditPages && handlePageEdit(pageGroup)
                              }
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Typography
                                  variant="small"
                                  className="font-medium"
                                >
                                  {t("books.page")}{" "}
                                  {pageGroup.storyPageNumber + 1}
                                  {", "}
                                  {pageGroup.storyPageNumber + 2}
                                </Typography>
                                {canEditPages && (
                                  <IconButton size="sm" variant="text">
                                    <FaEdit className="h-3 w-3" />
                                  </IconButton>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {pageGroup.illustration_page && (
                                  <div className="aspect-1-1-container rounded">
                                    <img
                                      src={
                                        pageGroup.illustration_page
                                          .illustrationUrl
                                      }
                                      alt={`Page ${pageGroup.storyPageNumber} illustration`}
                                      className="rounded"
                                    />
                                  </div>
                                )}
                                {pageGroup.text_page && (
                                  <div className="text-xs text-gray-600 line-clamp-4 content-center">
                                    {pageGroup.text_page.textContent}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Typography variant="small" className="text-gray-600">
                        {t("books.noPagesAvailable")}
                      </Typography>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookStatusBadge
                      status={currentBook.generationStatus}
                      size="lg"
                    />
                    <Typography variant="small" className="text-gray-600 mt-4">
                      {currentBook.generationStatus === "pending" &&
                        t("books.generationPending")}
                      {currentBook.generationStatus === "generating" &&
                        t("books.generationInProgress")}
                      {currentBook.generationStatus === "failed" &&
                        t("books.generationFailed")}
                    </Typography>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        bookTitle={currentBook.title}
      />

      {showPageEditor && selectedPage && (
        <PageEditor
          isOpen={showPageEditor}
          onClose={() => setShowPageEditor(false)}
          page={selectedPage}
          onSuccess={handlePageUpdateSuccess}
        />
      )}

      {/* Front Cover Selector */}
      <IllustrationSelector
        isOpen={showFrontCoverSelector}
        onClose={() => setShowFrontCoverSelector(false)}
        title={t("books.selectFrontCover")}
        currentUrl={currentBook.frontCoverImageUrl}
        alternatives={currentBook.alternativeFrontCovers || []}
        onSelect={handleFrontCoverSelect}
        isLoading={isUpdatingCover}
        onRegenerate={isOwner ? handleRegenerateFrontCover : null}
        isRegenerating={isRegeneratingFrontCover}
        canRegenerate={isOwner}
        pageCount={currentBook.pageCount}
        regenerationsUsed={currentBook.regenerationsUsed || 0}
      />

      {/* Back Cover Selector */}
      <IllustrationSelector
        isOpen={showBackCoverSelector}
        onClose={() => setShowBackCoverSelector(false)}
        title={t("books.selectBackCover")}
        currentUrl={currentBook.backCoverImageUrl}
        alternatives={currentBook.alternativeBackCovers || []}
        onSelect={handleBackCoverSelect}
        isLoading={isUpdatingCover}
        onRegenerate={isOwner ? handleRegenerateBackCover : null}
        isRegenerating={isRegeneratingBackCover}
        canRegenerate={isOwner}
        pageCount={currentBook.pageCount}
        regenerationsUsed={currentBook.regenerationsUsed || 0}
      />
      {/* Charity Selection Modal */}
      <CharitySelectionModal
        open={showCharityModal}
        onClose={() => setShowCharityModal(false)}
        onConfirm={handleCharityConfirm}
        bookId={currentBook?.id}
      />

      {/* Payment Success Modal */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("books.paymentSuccessTitle")}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t("books.paymentSuccessMessage")}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentSuccessModal(false);
                    setPaymentSessionId(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  className="flex-1 flex bg-green-600 hover:bg-green-700 justify-center"
                  onClick={handlePaymentSuccessDownload}
                >
                  <FaDownload className="h-4 w-4 mr-2" />
                  <span>{t("books.downloadNow")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
