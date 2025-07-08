import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  IconButton,
} from "@material-tailwind/react";
import {
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaDownload,
  FaGlobe,
  FaLock,
  FaTrash,
  FaRedo,
} from "react-icons/fa";

import BookStatusBadge from "@/components/Books/BookStatusBadge";
import DeleteConfirmationModal from "@/components/Books/DeleteConfirmationModal";
import PageEditor from "@/components/Books/PageEditor";
import IllustrationSelector from "@/components/Books/IllustrationSelector";
import {
  fetchBookById,
  updateBook,
  toggleBookPublic,
  deleteBook,
  retryBookGeneration,
  clearCurrentBook,
} from "@/stores/reducers/books";
import BookService from "@/services/bookService";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const BookDetail = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const translateError = useErrorTranslation();

  const { currentBook, isLoading, isUpdating } = useSelector(
    (state) => state.books
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [bookPages, setBookPages] = useState([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [showFrontCoverSelector, setShowFrontCoverSelector] = useState(false);
  const [showBackCoverSelector, setShowBackCoverSelector] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const [metadataForm, setMetadataForm] = useState({
    title: "",
    description: "",
    dedication: "",
    moral: "",
    moral_of_back_cover: "",
  });

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

  // Update metadata form when book data changes
  useEffect(() => {
    if (currentBook) {
      setMetadataForm({
        title: currentBook.title || "",
        description: currentBook.description || "",
        dedication: currentBook.dedication || "",
        moral: currentBook.moral || "",
        moral_of_back_cover: currentBook.moralOfBackCover || "",
      });
    }
  }, [currentBook]);

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

  const handleMetadataEdit = () => {
    setIsEditingMetadata(true);
  };

  const handleMetadataCancel = () => {
    setIsEditingMetadata(false);
    // Reset form to original values
    if (currentBook) {
      setMetadataForm({
        title: currentBook.title || "",
        description: currentBook.description || "",
        dedication: currentBook.dedication || "",
        moral: currentBook.moral || "",
        moral_of_back_cover: currentBook.moralOfBackCover || "",
      });
    }
  };

  const handleMetadataSave = async () => {
    try {
      await dispatch(
        updateBook({ bookId: id, updateData: metadataForm })
      ).unwrap();
      setIsEditingMetadata(false);
      toast.success(t("books.updateSuccess"));
    } catch (error) {
      logger.error("Update book metadata error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
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

  const handlePageUpdateSuccess = () => {
    setShowPageEditor(false);
    setSelectedPage(null);
    loadBookPages(); // Reload pages to get updated data
  };

  const handleFrontCoverSelect = async (selectedUrl) => {
    try {
      setIsUpdatingCover(true);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  const canEditMetadata =
    currentBook && currentBook.generationStatus === "completed" && isOwner;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="text"
                className="flex items-center gap-2"
                onClick={() =>
                  navigate(isAuthenticated ? "/my-books" : "/gallery")
                }
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
                  onClick={() => window.open(currentBook.pdfUrl, "_blank")}
                >
                  <FaDownload className="h-4 w-4" />
                  {t("books.download")}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <Typography variant="h6">{t("books.bookDetails")}</Typography>
                  {canEditMetadata && (
                    <div className="flex items-center gap-2">
                      {isEditingMetadata ? (
                        <>
                          <IconButton
                            size="sm"
                            variant="text"
                            color="green"
                            onClick={handleMetadataSave}
                            disabled={isUpdating}
                          >
                            <FaSave className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="text"
                            color="red"
                            onClick={handleMetadataCancel}
                            disabled={isUpdating}
                          >
                            <FaTimes className="h-4 w-4" />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          size="sm"
                          variant="text"
                          onClick={handleMetadataEdit}
                        >
                          <FaEdit className="h-4 w-4" />
                        </IconButton>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {isEditingMetadata ? (
                    <>
                      <Input
                        label={t("books.title")}
                        value={metadataForm.title}
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        label={t("books.description")}
                        value={metadataForm.description}
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                      <Textarea
                        label={t("books.moral")}
                        value={metadataForm.moral}
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
                            ...prev,
                            moral: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                      <Textarea
                        label={t("books.dedication")}
                        value={metadataForm.dedication}
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
                            ...prev,
                            dedication: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                      <Textarea
                        label={t("books.backCoverMoral")}
                        value={metadataForm.moral_of_back_cover}
                        onChange={(e) =>
                          setMetadataForm((prev) => ({
                            ...prev,
                            moral_of_back_cover: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <Typography
                          variant="small"
                          className="text-gray-600 mb-1"
                        >
                          {t("books.description")}
                        </Typography>
                        <Typography>{currentBook.description}</Typography>
                      </div>
                      <div>
                        <Typography
                          variant="small"
                          className="text-gray-600 mb-1"
                        >
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
                          <Typography>
                            {currentBook.moralOfBackCover}
                          </Typography>
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
                    </>
                  )}
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
                      {currentBook.characterIds.map((character) => (
                        <div
                          key={character.id}
                          className="flex items-center gap-3"
                        >
                          {character.referenceImageUrl && (
                            <img
                              src={character.referenceImageUrl}
                              alt={character.characterName}
                              className="w-12 h-12 object-cover rounded-full"
                            />
                          )}
                          <div>
                            <Typography variant="small" className="font-medium">
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
                          <img
                            src={currentBook.frontCoverImageUrl}
                            alt={t("books.frontCoverAlt")}
                            className="w-full h-48 object-cover rounded-lg"
                          />
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
                          <img
                            src={currentBook.backCoverImageUrl}
                            alt={t("books.backCoverAlt")}
                            className="w-full h-48 object-cover rounded-lg"
                          />
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
                                  <img
                                    src={
                                      pageGroup.illustration_page
                                        .illustrationUrl
                                    }
                                    alt={`Page ${pageGroup.storyPageNumber} illustration`}
                                    className="w-full h-24 object-cover rounded"
                                  />
                                )}
                                {pageGroup.text_page && (
                                  <div className="text-xs text-gray-600 line-clamp-4">
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
      />
    </div>
  );
};

export default BookDetail;
