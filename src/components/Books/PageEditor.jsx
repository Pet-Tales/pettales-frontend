import { useState, useEffect } from "react";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Textarea,
  Card,
  CardBody,
} from "@material-tailwind/react";
import { FaSave, FaTimes, FaImage, FaFont } from "react-icons/fa";
import BookService from "@/services/bookService";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";
import IllustrationSelector from "./IllustrationSelector";

const PageEditor = ({ isOpen, onClose, page, onSuccess }) => {
  const { t } = useValidatedTranslation();
  const translateError = useErrorTranslation();

  const [textContent, setTextContent] = useState("");
  const [selectedIllustration, setSelectedIllustration] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showIllustrationSelector, setShowIllustrationSelector] =
    useState(false);

  // Initialize form data when page changes
  useEffect(() => {
    if (page) {
      const textPage = page.text_page;
      const illustrationPage = page.illustration_page;

      setTextContent(textPage?.textContent || "");
      setSelectedIllustration(illustrationPage?.illustrationUrl || "");
      setHasChanges(false);
    } else {
      // Reset form when page is null
      setTextContent("");
      setSelectedIllustration("");
      setHasChanges(false);
    }
  }, [page]);

  const handleTextChange = (value) => {
    setTextContent(value);
    setHasChanges(true);
  };

  const handleIllustrationSelect = (url) => {
    setSelectedIllustration(url);
    setHasChanges(true);
    setShowIllustrationSelector(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);

      const updates = [];

      // Update text page if it exists and text changed
      if (
        page.text_page &&
        page.text_page.id &&
        page.text_page.textContent !== textContent
      ) {
        updates.push(
          BookService.updatePage(page.text_page.id, {
            text_content: textContent,
          })
        );
      }

      // Update illustration page if it exists and illustration changed
      if (
        page.illustration_page &&
        page.illustration_page.id &&
        page.illustration_page.illustrationUrl !== selectedIllustration
      ) {
        updates.push(
          BookService.updatePage(page.illustration_page.id, {
            illustration_url: selectedIllustration,
          })
        );
      }

      // Execute all updates
      if (updates.length > 0) {
        await Promise.all(updates);
        toast.success(t("books.pageUpdateSuccess"));
        onSuccess?.();
      } else {
        onClose();
      }
    } catch (error) {
      logger.error("Update page error:", error);
      const errorMessage = translateError(error?.data?.message || error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm(t("books.unsavedChangesWarning"))) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!page) return null;

  const illustrationPage = page.illustration_page;

  const availableIllustrations = illustrationPage
    ? [
        illustrationPage.illustrationUrl,
        ...(illustrationPage.alternativeIllustrations || []),
      ].filter(Boolean)
    : [];

  return (
    <Dialog
      open={isOpen}
      handler={handleClose}
      size="xl"
      className="max-h-[90vh]"
    >
      <DialogHeader className="flex items-center gap-3">
        <Typography variant="h5">
          {t("books.editPage")} {page.story_page_number}
        </Typography>
      </DialogHeader>

      <DialogBody className="overflow-y-auto max-h-[60vh]">
        <div className="space-y-6">
          {/* Text Editor */}
          {page.text_page && (
            <Card>
              <CardBody>
                <div className="flex items-center gap-2 mb-4">
                  <FaFont className="h-5 w-5 text-blue-500" />
                  <Typography variant="h6">{t("books.pageText")}</Typography>
                </div>
                <Textarea
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder={t("books.enterPageText")}
                />
                <Typography variant="small" className="text-gray-600 mt-2">
                  {textContent.length} {t("books.characters")}
                </Typography>
              </CardBody>
            </Card>
          )}
          {/* Illustration Selector */}
          {illustrationPage && availableIllustrations.length > 0 && (
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaImage className="h-5 w-5 text-green-500" />
                    <Typography variant="h6">
                      {t("books.pageIllustration")}
                    </Typography>
                  </div>
                  {availableIllustrations.length > 1 && (
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => setShowIllustrationSelector(true)}
                    >
                      {t("books.changeCover")}
                    </Button>
                  )}
                </div>
                {selectedIllustration && (
                  <img
                    src={selectedIllustration}
                    alt={t("books.selectedIllustration")}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </CardBody>
            </Card>
          )}
          {/* Preview */}
          <Card>
            <CardBody>
              <Typography variant="h6" className="mb-4">
                {t("books.preview")}
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedIllustration && (
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-2">
                      {t("books.illustration")}
                    </Typography>
                    <img
                      src={selectedIllustration}
                      alt={t("books.selectedIllustration")}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {textContent && (
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-2">
                      {t("books.text")}
                    </Typography>
                    <div className="bg-gray-50 p-4 rounded-lg h-48 overflow-y-auto">
                      <Typography
                        variant="small"
                        className="whitespace-pre-wrap"
                      >
                        {textContent}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-2">
        <Button
          variant="outlined"
          color="gray"
          onClick={handleClose}
          disabled={isSaving}
          className="flex flex-1 justify-center"
        >
          <FaTimes className="h-4 w-4 mr-2" />
          <span>{t("common.cancel")}</span>
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex flex-1 justify-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>{t("books.saving")}</span>
            </>
          ) : (
            <>
              <FaSave className="h-4 w-4 mr-2" />
              <span>{t("books.saveChanges")}</span>
            </>
          )}
        </Button>
      </DialogFooter>

      {/* Illustration Selector Modal */}
      <IllustrationSelector
        isOpen={showIllustrationSelector}
        onClose={() => setShowIllustrationSelector(false)}
        title={t("books.pageIllustration")}
        currentUrl={selectedIllustration}
        alternatives={availableIllustrations}
        onSelect={handleIllustrationSelect}
        isLoading={isSaving}
      />
    </Dialog>
  );
};

export default PageEditor;
