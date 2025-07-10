import { useState } from "react";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Card,
  CardBody,
} from "@material-tailwind/react";
import { FaTimes, FaSave, FaImage, FaRedo } from "react-icons/fa";

const IllustrationSelector = ({
  isOpen,
  onClose,
  title,
  currentUrl,
  alternatives = [],
  onSelect,
  isLoading = false,
  onRegenerate = null,
  isRegenerating = false,
  canRegenerate = false,
}) => {
  const { t } = useValidatedTranslation();
  const [selectedUrl, setSelectedUrl] = useState(currentUrl);

  // Combine current URL with alternatives, ensuring no duplicates
  const allOptions = [
    currentUrl,
    ...alternatives.filter((url) => url !== currentUrl),
  ].filter(Boolean);

  const handleSelect = (url) => {
    setSelectedUrl(url);
  };

  const handleSave = () => {
    if (selectedUrl !== currentUrl) {
      onSelect(selectedUrl);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedUrl(currentUrl); // Reset to original selection
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} handler={handleClose} size="lg">
      <DialogHeader className="flex items-center gap-2">
        <FaImage className="h-5 w-5 text-blue-500" />
        <Typography variant="h5">{title}</Typography>
      </DialogHeader>

      <DialogBody className="overflow-y-auto max-h-[60vh]">
        <Typography variant="small" className="text-gray-600 mb-4">
          {t("books.selectIllustrationDescription")}
        </Typography>

        {allOptions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allOptions.map((url, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedUrl === url
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleSelect(url)}
              >
                <div className="aspect-4-3-container rounded-lg">
                  <img
                    src={url}
                    alt={t("books.illustrationOption", { number: index + 1 })}
                    className="rounded-lg"
                  />
                </div>
                {selectedUrl === url && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                {url === currentUrl && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      {t("books.current")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Typography variant="small" className="text-gray-600">
              {t("books.noAlternativesAvailable")}
            </Typography>
          </div>
        )}

        {/* Preview of selected illustration */}
        {selectedUrl && (
          <Card className="mt-6">
            <CardBody>
              <Typography variant="h6" className="mb-4">
                {t("books.preview")}
              </Typography>
              <div className="aspect-4-3-container max-w-md mx-auto rounded-lg">
                <img
                  src={selectedUrl}
                  alt={t("books.selectedIllustration")}
                  className="rounded-lg"
                />
              </div>
            </CardBody>
          </Card>
        )}
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <Button
          variant="text"
          onClick={handleClose}
          disabled={isLoading || isRegenerating}
          className="flex justify-center"
        >
          <FaTimes className="h-4 w-4 mr-2" />
          {t("common.cancel")}
        </Button>

        <div className="flex gap-2">
          {canRegenerate && onRegenerate && (
            <Button
              variant="outlined"
              color="blue"
              onClick={onRegenerate}
              disabled={isLoading || isRegenerating}
              className="flex items-center gap-2"
            >
              <FaRedo
                className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
              />
              {t("books.regenerate")}
            </Button>
          )}

          <Button
            variant="filled"
            color="blue"
            onClick={handleSave}
            disabled={isLoading || isRegenerating || selectedUrl === currentUrl}
            className="flex justify-center"
          >
            <FaSave className="h-4 w-4 mr-2" />
            {isLoading ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default IllustrationSelector;
