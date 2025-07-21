import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Textarea,
  Select,
  Option,
  Button,
  Checkbox,
} from "@material-tailwind/react";
import { FaArrowLeft, FaBook } from "react-icons/fa";

import { createBook } from "@/stores/reducers/books";
import { fetchCharacters } from "@/stores/reducers/characters";
import { fetchCreditBalance, verifyPurchase } from "@/stores/reducers/credits";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";
import GalleryService from "@/services/galleryService";
import { smartNavigateBack, getFallbackPath } from "@/utils/navigationUtils";
import CreditPurchaseModal from "@/components/Credits/CreditPurchaseModal";

// Credit costs for different book types
const CREDIT_COSTS = {
  12: 400, // 12-page book
  16: 450, // 16-page book
  24: 500, // 24-page book
};

const CreateBook = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const translateError = useErrorTranslation();

  const { isCreating } = useSelector((state) => state.books);
  const { characters, isLoading: isLoadingCharacters } = useSelector(
    (state) => state.characters
  );
  const { balance: creditBalance } = useSelector((state) => state.credits);
  const { user } = useSelector((state) => state.auth);

  // Get template data from location state (if coming from gallery)
  const templateDataFromState = location.state?.template;

  // State for template data loaded from URL parameter
  const [templateData, setTemplateData] = useState(templateDataFromState);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Ref to track which template IDs we've already loaded to prevent infinite loops
  const loadedTemplateIds = useRef(new Set());

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dedication: "",
    moral: "",
    language: "en",
    pageCount: 12,
    illustrationStyle: "vector_art",
    characterIds: [],
  });

  const [errors, setErrors] = useState({});
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);

  // Load characters on component mount
  useEffect(() => {
    dispatch(fetchCharacters({ page: 1, limit: 50, reset: true }));
  }, [dispatch]);

  // Load template data from URL parameter if present
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (
      templateId &&
      !templateDataFromState &&
      !templateData &&
      !isLoadingTemplate &&
      !loadedTemplateIds.current.has(templateId)
    ) {
      // Mark this template ID as being loaded
      loadedTemplateIds.current.add(templateId);
      setIsLoadingTemplate(true);

      GalleryService.getBookTemplate(templateId)
        .then((response) => {
          const loadedTemplate = response.data.data.template;
          setTemplateData(loadedTemplate);
          toast.success(t("gallery.templateLoaded"));
        })
        .catch((error) => {
          logger.error("Load template error:", error);
          const errorMessage = translateError(error?.data?.message || error);
          toast.error(errorMessage);
          // Remove from loaded set on error so it can be retried
          loadedTemplateIds.current.delete(templateId);
        })
        .finally(() => {
          setIsLoadingTemplate(false);
        });
    }
  }, [searchParams, templateDataFromState, templateData, isLoadingTemplate]);

  // Helper function to convert language names to codes
  const getLanguageCode = (language) => {
    if (!language) return "en";

    // If it's already a code, return it
    if (language === "en" || language === "es") return language;

    // Convert language names to codes
    const languageMap = {
      English: "en",
      Spanish: "es",
      Español: "es",
    };

    return languageMap[language] || "en";
  };

  // Pre-fill form with template data if available
  useEffect(() => {
    if (templateData) {
      const languageCode = getLanguageCode(templateData.language);

      const newFormData = {
        title: templateData.title || "",
        description: templateData.description || "",
        dedication: templateData.dedication || "",
        moral: templateData.moral || "",
        language: languageCode,
        pageCount: templateData.pageCount || 12,
        illustrationStyle: templateData.illustrationStyle || "disney",
        characterIds: [], // Characters need to be selected manually
      };
      setFormData(newFormData);
    }
  }, [templateData]);

  // Fetch credit balance when component mounts
  useEffect(() => {
    dispatch(fetchCreditBalance());
  }, [dispatch]);

  // Restore form data from localStorage if available
  useEffect(() => {
    const savedFormData = localStorage.getItem("bookCreationFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Only restore if we don't already have template data
        if (!templateData && !templateDataFromState) {
          setFormData(parsedData);
          // Clear the saved data after restoring
          localStorage.removeItem("bookCreationFormData");
          // toast.info(t("books.formDataRestored"));
        }
      } catch (error) {
        logger.error("Failed to restore form data:", error);
        localStorage.removeItem("bookCreationFormData");
      }
    }
  }, [templateData, templateDataFromState, t]);

  // Handle payment success/failure from Stripe checkout
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "success") {
      // Payment was successful, show success message
      toast.success(t("credits.purchaseSuccess"));

      // Function to handle credit verification and refresh
      const handleCreditUpdate = async () => {
        try {
          if (sessionId) {
            // If we have a session ID, verify the purchase (this ensures credits are added)
            await dispatch(verifyPurchase(sessionId)).unwrap();
            logger.info("Purchase verified successfully");
          } else {
            // Fallback: just refresh credit balance with retry mechanism
            const refreshCreditsWithRetry = async (
              retries = 3,
              delay = 2000
            ) => {
              for (let i = 0; i < retries; i++) {
                try {
                  await dispatch(fetchCreditBalance()).unwrap();
                  logger.info(
                    `Credit balance refreshed successfully on attempt ${i + 1}`
                  );
                  break;
                } catch (error) {
                  logger.warn(
                    `Failed to refresh credit balance on attempt ${i + 1}:`,
                    error
                  );
                  if (i < retries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                  }
                }
              }
            };
            await refreshCreditsWithRetry();
          }
        } catch (error) {
          logger.error("Failed to update credits after payment:", error);
          // Fallback to just refreshing balance
          dispatch(fetchCreditBalance());
        }
      };

      // Start credit update process
      handleCreditUpdate();

      // Check if we have saved form data and auto-submit if form is valid
      const savedFormData = localStorage.getItem("bookCreationFormData");
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
          localStorage.removeItem("bookCreationFormData");

          // Auto-submit the form after a longer delay to allow credits to be processed
          setTimeout(() => {
            const form = document.querySelector("form");
            if (form) {
              form.requestSubmit();
            }
          }, 3000); // Increased delay to 3 seconds
        } catch (error) {
          logger.error(
            "Failed to restore and submit form after payment:",
            error
          );
        }
      }

      // Clean up the URL parameters
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("payment");
      newUrl.searchParams.delete("session_id");
      window.history.replaceState({}, "", newUrl);
    } else if (paymentStatus === "cancelled") {
      toast.info(t("credits.paymentCancelled"));

      // Clean up the URL parameter
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("payment");
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, dispatch, t]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleCharacterToggle = (characterId) => {
    setFormData((prev) => {
      const currentIds = prev.characterIds;
      const isSelected = currentIds.includes(characterId);

      if (isSelected) {
        // Remove character
        return {
          ...prev,
          characterIds: currentIds.filter((id) => id !== characterId),
        };
      } else {
        // Add character (max 3)
        if (currentIds.length >= 3) {
          toast.warning(t("books.maxCharactersWarning"));
          return prev;
        }
        return {
          ...prev,
          characterIds: [...currentIds, characterId],
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("books.validation.titleRequired");
    } else if (formData.title.length < 2) {
      newErrors.title = t("books.validation.titleTooShort");
    } else if (formData.title.length > 100) {
      newErrors.title = t("books.validation.titleTooLong");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("books.validation.descriptionRequired");
    } else if (formData.description.length < 10) {
      newErrors.description = t("books.validation.descriptionTooShort");
    } else if (formData.description.length > 500) {
      newErrors.description = t("books.validation.descriptionTooLong");
    }

    if (!formData.moral.trim()) {
      newErrors.moral = t("books.validation.moralRequired");
    } else if (formData.moral.length < 5) {
      newErrors.moral = t("books.validation.moralTooShort");
    } else if (formData.moral.length > 200) {
      newErrors.moral = t("books.validation.moralTooLong");
    }

    if (formData.dedication && formData.dedication.length > 200) {
      newErrors.dedication = t("books.validation.dedicationTooLong");
    }

    if (formData.characterIds.length === 0) {
      newErrors.characterIds = t("books.validation.charactersRequired");
    }

    // Check if user has sufficient credits
    const requiredCredits = CREDIT_COSTS[formData.pageCount];
    const currentBalance = user?.creditsBalance || creditBalance || 0;
    if (currentBalance < requiredCredits) {
      newErrors.credits = t("books.validation.insufficientCredits", {
        required: requiredCredits,
        available: currentBalance,
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("books.validation.fixErrors"));
      return;
    }

    try {
      // Transform camelCase to snake_case for backend
      const backendData = {
        title: formData.title,
        description: formData.description,
        dedication: formData.dedication,
        moral: formData.moral,
        language: formData.language,
        page_count: formData.pageCount,
        illustration_style: formData.illustrationStyle,
        character_ids: formData.characterIds,
      };

      const result = await dispatch(createBook(backendData)).unwrap();
      toast.success(t("books.createSuccess"));
      navigate(`/books/${result.id}`);
    } catch (error) {
      logger.error("Create book error:", error);
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
    }
  };

  const getCharacterDisplayName = (character) => {
    return `${character.characterName} (${t(
      `characters.${character.characterType}`
    )})`;
  };

  return (
    <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="text"
            className="flex items-center gap-2"
            onClick={() => {
              const fallbackPath = getFallbackPath(
                true,
                window.location.pathname
              ); // Always authenticated on this page
              smartNavigateBack(navigate, fallbackPath, true);
            }}
          >
            <FaArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
          <div>
            <Typography variant="h2" className="text-gray-900">
              {t("books.createBook")}
            </Typography>
            {templateData && (
              <Typography variant="small" className="text-gray-600">
                {t("books.basedOnTemplate", {
                  title: templateData.original_book?.title,
                })}
              </Typography>
            )}
          </div>
        </div>

        {/* Show loading state when loading template from URL */}
        {isLoadingTemplate && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!isLoadingTemplate && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardBody className="space-y-6">
                {/* Basic Information */}
                <div>
                  <Typography
                    variant="h5"
                    className="mb-4 flex items-center gap-2"
                  >
                    <FaBook className="h-5 w-5" />
                    {t("books.basicInformation")}
                  </Typography>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label={t("books.title")}
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        error={!!errors.title}
                        required
                      />
                      {errors.title && (
                        <Typography
                          variant="small"
                          color="red"
                          className="mt-1"
                        >
                          {errors.title}
                        </Typography>
                      )}
                    </div>

                    <div>
                      <Select
                        label={t("books.language")}
                        value={formData.language}
                        onChange={(value) =>
                          handleInputChange("language", value)
                        }
                      >
                        <Option value="en">{t("languages.english")}</Option>
                        <Option value="es">{t("languages.spanish")}</Option>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Textarea
                      label={t("books.description")}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      error={!!errors.description}
                      rows={3}
                      required
                    />
                    {errors.description && (
                      <Typography variant="small" color="red" className="mt-1">
                        {errors.description}
                      </Typography>
                    )}
                  </div>

                  <div className="mt-4">
                    <Textarea
                      label={t("books.moral")}
                      value={formData.moral}
                      onChange={(e) =>
                        handleInputChange("moral", e.target.value)
                      }
                      error={!!errors.moral}
                      rows={2}
                      required
                    />
                    {errors.moral && (
                      <Typography variant="small" color="red" className="mt-1">
                        {errors.moral}
                      </Typography>
                    )}
                  </div>

                  <div className="mt-4">
                    <Textarea
                      label={t("books.dedication")}
                      value={formData.dedication}
                      onChange={(e) =>
                        handleInputChange("dedication", e.target.value)
                      }
                      error={!!errors.dedication}
                      rows={2}
                    />
                    {errors.dedication && (
                      <Typography variant="small" color="red" className="mt-1">
                        {errors.dedication}
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Book Settings */}
                <div>
                  <Typography variant="h6" className="mb-4">
                    {t("books.bookSettings")}
                  </Typography>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Select
                        label={t("books.pageCount")}
                        value={formData.pageCount.toString()}
                        onChange={(value) =>
                          handleInputChange("pageCount", parseInt(value))
                        }
                      >
                        <Option value="12">12 {t("books.pages")}</Option>
                        <Option value="16">16 {t("books.pages")}</Option>
                        <Option value="24">24 {t("books.pages")}</Option>
                      </Select>
                    </div>

                    <div>
                      <Select
                        label={t("books.illustrationStyle")}
                        value={formData.illustrationStyle}
                        onChange={(value) =>
                          handleInputChange("illustrationStyle", value)
                        }
                      >
                        <Option value="anime">{t("books.styles.anime")}</Option>
                        <Option value="disney">
                          {t("books.styles.disney")}
                        </Option>
                        <Option value="vector_art">
                          {t("books.styles.vectorArt")}
                        </Option>
                        <Option value="classic_watercolor">
                          {t("books.styles.classic_watercolor")}
                        </Option>
                      </Select>
                    </div>
                  </div>

                  {/* Credit Cost Display */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography
                          variant="small"
                          className="font-medium text-blue-900"
                        >
                          {t("books.creditCost")}
                        </Typography>
                        <Typography variant="small" className="text-blue-700">
                          {CREDIT_COSTS[formData.pageCount]}{" "}
                          {t("pricing.credits")}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="small" className="text-blue-700">
                          {t("books.currentBalance")}:{" "}
                          {user?.creditsBalance?.toLocaleString() || 0}
                        </Typography>
                        {(user?.creditsBalance || 0) <
                          CREDIT_COSTS[formData.pageCount] && (
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="small"
                              className="text-red-600 font-medium"
                            >
                              {t("books.insufficientCredits")}
                            </Typography>
                            <button
                              type="button"
                              onClick={() => setShowCreditPurchaseModal(true)}
                              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer"
                            >
                              {t("books.buyMore")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Credit Error Display */}
                  {errors.credits && (
                    <div className="mt-2">
                      <Typography variant="small" color="red">
                        {errors.credits}
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Character Selection */}
                <div>
                  <Typography variant="h6" className="mb-4">
                    {t("books.selectCharacters")}
                  </Typography>
                  <Typography variant="small" className="text-gray-600 mb-4">
                    {t("books.selectCharactersDescription")}
                  </Typography>

                  {isLoadingCharacters ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : characters.length === 0 ? (
                    <div className="text-center py-8">
                      <Typography
                        variant="small"
                        className="text-gray-600 mb-4"
                      >
                        {t("books.noCharactersAvailable")}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/characters/create")}
                      >
                        {t("characters.createCharacter")}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {characters.map((character) => (
                        <div
                          key={character.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={formData.characterIds.includes(
                              character.id
                            )}
                            onChange={() => handleCharacterToggle(character.id)}
                            disabled={
                              !formData.characterIds.includes(character.id) &&
                              formData.characterIds.length >= 3
                            }
                          />
                          <div className="flex-1">
                            <Typography variant="small" className="font-medium">
                              {getCharacterDisplayName(character)}
                            </Typography>
                            {character.referenceImageUrl && (
                              <img
                                src={character.referenceImageUrl}
                                alt={character.characterName}
                                className="w-12 h-12 object-cover rounded mt-2"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.characterIds && (
                    <Typography variant="small" color="red" className="mt-2">
                      {errors.characterIds}
                    </Typography>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    disabled={isCreating || characters.length === 0}
                    className="flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t("books.creating")}
                      </>
                    ) : (
                      <>
                        <FaBook className="h-4 w-4" />
                        {t("books.createBook")}
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </form>
        )}
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditPurchaseModal}
        onClose={() => setShowCreditPurchaseModal(false)}
        requiredCredits={CREDIT_COSTS[formData.pageCount]}
        currentBalance={user?.creditsBalance || creditBalance || 0}
        onPurchaseStart={() => {
          // Save form data to localStorage before redirecting to Stripe
          localStorage.setItem(
            "bookCreationFormData",
            JSON.stringify(formData)
          );
        }}
      />
    </div>
  );
};

export default CreateBook;
