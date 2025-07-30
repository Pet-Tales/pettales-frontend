import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Card,
  CardBody,
  Typography,
  Stepper,
  Step,
  Button,
  Spinner,
} from "@material-tailwind/react";
import {
  FaArrowLeft,
  FaShippingFast,
  FaClipboardCheck,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import ShippingAddressForm from "@/components/PrintOrder/ShippingAddressForm";
import ShippingMethodSelector from "@/components/PrintOrder/ShippingMethodSelector";
import OrderReviewConfirmation from "@/components/PrintOrder/OrderReviewConfirmation";
import CreditPurchaseModal from "@/components/Credits/CreditPurchaseModal";
import BookService from "@/services/bookService";
import PrintOrderService from "@/services/printOrderService";
import { smartNavigateBack } from "@/utils/navigationUtils";
import { fetchCreditBalance, verifyPurchase } from "@/stores/reducers/credits";
import logger from "@/utils/logger";

const PrintOrderPage = () => {
  console.log("PrintOrderPage component rendering");

  const { t } = useValidatedTranslation();
  const { id: bookId } = useParams(); // Extract 'id' parameter and rename it to 'bookId'
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { creditBalance } = useSelector((state) => state.credits);

  console.log("PrintOrder params:", { bookId, user: user?.id });

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [book, setBook] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    shippingAddress: {
      name: "",
      street1: "",
      street2: "",
      city: "",
      state_code: "",
      postcode: "",
      country_code: "US",
      phone_number: "",
      email: user?.email || "",
    },
    shippingLevel: "GROUND",
  });
  const [costData, setCostData] = useState(null);

  const steps = [
    {
      icon: FaShippingFast,
      title: t("printOrder.steps.shipping"),
      // description: t("printOrder.steps.shippingDesc"),
    },
    {
      icon: FaClipboardCheck,
      title: t("printOrder.steps.review"),
      // description: t("printOrder.steps.reviewDesc"),
    },
    {
      icon: FaCheckCircle,
      title: t("printOrder.steps.confirm"),
      // description: t("printOrder.steps.confirmDesc"),
    },
  ];

  // Handle credit verification after payment (similar to book creation)
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
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
                  if (i === retries - 1) {
                    throw error;
                  }
                  await new Promise((resolve) => setTimeout(resolve, delay));
                }
              }
            };

            await refreshCreditsWithRetry();
          }
        } catch (error) {
          logger.error("Failed to update credits after payment:", error);
          toast.error(t("printOrder.errors.creditUpdateFailed"));
        }
      };

      // Start credit update process
      handleCreditUpdate();

      // Check if we have saved order data and restore it
      const savedOrderData = localStorage.getItem("printOrderFormData");
      if (savedOrderData) {
        try {
          const parsedData = JSON.parse(savedOrderData);
          setOrderData(parsedData);
          localStorage.removeItem("printOrderFormData");

          // Auto-advance to the review step after a delay
          setTimeout(() => {
            setCurrentStep(2);
          }, 2000);
        } catch (error) {
          logger.error("Failed to restore order data after payment:", error);
        }
      }
    }
  }, [searchParams, dispatch, t]);

  // Load book data on component mount
  useEffect(() => {
    const loadBookData = async () => {
      try {
        setLoading(true);

        console.log("Loading book data for bookId:", bookId);
        const response = await BookService.getBookById(bookId);

        console.log("Book service response:", response);

        if (!response?.data?.success) {
          throw new Error(response.message);
        }

        const bookData = response.data.data.book;
        console.log("Book data received:", bookData);

        // Check if user owns the book
        if (user && bookData.userId.id !== user.id) {
          toast.error(t("printOrder.errors.unauthorized"));
          navigate("/my-books");
          return;
        }

        // Check if book is completed
        if (bookData.generationStatus !== "completed") {
          toast.error(t("printOrder.errors.bookNotCompleted"));
          navigate(`/books/${bookId}`);
          return;
        }

        setBook(bookData);
      } catch (error) {
        logger.error("Failed to load book data:", error);
        console.error("Error details:", error);
        toast.error(error.message || t("printOrder.errors.loadBook"));
        navigate("/my-books");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadBookData();
    } else {
      setLoading(false);
    }
  }, [bookId, user, navigate, t]);

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate shipping address and calculate cost
      await handleShippingSubmit();
    } else if (currentStep === 1) {
      // Move to confirmation step
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      smartNavigateBack(navigate, `/books/${bookId}`);
    }
  };

  // Handle shipping address submission
  const handleShippingSubmit = async () => {
    try {
      setSubmitting(true);
      setApiError(null); // Clear any previous errors

      // Calculate cost
      const costResponse = await PrintOrderService.calculateCost({
        bookId,
        quantity: orderData.quantity,
        shippingAddress: orderData.shippingAddress,
        shippingLevel: orderData.shippingLevel,
      });

      if (!costResponse.success) {
        throw new Error(costResponse.message);
      }

      setCostData(costResponse.data);
      setCurrentStep(1);
    } catch (error) {
      logger.error("Failed to calculate cost:", error);

      // Set the API error to display in the form
      setApiError(error.message || t("printOrder.errors.calculateCost"));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle final order submission
  const handleOrderSubmit = async () => {
    try {
      setSubmitting(true);

      const orderResponse = await PrintOrderService.createPrintOrder({
        bookId,
        quantity: orderData.quantity,
        shippingAddress: orderData.shippingAddress,
        shippingLevel: orderData.shippingLevel,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      toast.success(t("printOrder.success.orderCreated"));
      navigate(`/my-orders/${orderResponse.data.printOrder._id}`);
    } catch (error) {
      logger.error("Failed to create order:", error);
      toast.error(error.message || t("printOrder.errors.createOrder"));
    } finally {
      setSubmitting(false);
    }
  };

  // Update order data
  const updateOrderData = (updates) => {
    setOrderData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  console.log("Render state:", { loading, book: !!book });

  // Early return for debugging - remove this after testing
  if (!bookId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>No book ID provided</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
        <div className="ml-4">Loading print order page...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>No book data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="text"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleBack}
        >
          <FaArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <div>
          <Typography variant="h4" className="text-gray-900">
            {t("printOrder.title")}
          </Typography>
          <Typography variant="small" className="text-gray-600">
            {t("printOrder.subtitle", { title: book.title })}
          </Typography>
        </div>
      </div>

      {/* Stepper */}
      <Card className="mb-8">
        <CardBody>
          <Stepper activeStep={currentStep} className="mb-4">
            {steps.map((step, index) => (
              <Step key={index} className="cursor-pointer">
                <step.icon className="h-5 w-5" />
                <div className="absolute -bottom-[2.5rem] w-max text-center">
                  <Typography
                    variant="small"
                    className={`font-medium ${
                      index <= currentStep ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </Typography>
                </div>
              </Step>
            ))}
          </Stepper>
          <div className="mt-8">
            <Typography variant="small" className="text-gray-600 text-center">
              {steps[currentStep]?.description}
            </Typography>
          </div>
        </CardBody>
      </Card>

      {/* Step Content */}
      <Card>
        <CardBody>
          {currentStep === 0 && (
            <ShippingAddressForm
              orderData={orderData}
              updateOrderData={updateOrderData}
              onNext={handleNext}
              loading={submitting}
              apiError={apiError}
              onClearError={() => setApiError(null)}
            />
          )}

          {currentStep === 1 && (
            <ShippingMethodSelector
              orderData={orderData}
              updateOrderData={updateOrderData}
              costData={costData}
              book={book}
              bookId={bookId}
              onNext={handleNext}
              onBack={handleBack}
              loading={submitting}
              onCostDataUpdate={setCostData}
            />
          )}

          {currentStep === 2 && (
            <OrderReviewConfirmation
              orderData={orderData}
              costData={costData}
              book={book}
              onSubmit={handleOrderSubmit}
              onBack={handleBack}
              loading={submitting}
              currentBalance={user?.creditsBalance || creditBalance || 0}
              onShowCreditPurchase={() => setShowCreditPurchaseModal(true)}
            />
          )}
        </CardBody>
      </Card>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditPurchaseModal}
        onClose={() => setShowCreditPurchaseModal(false)}
        requiredCredits={costData?.total_cost_credits || 0}
        currentBalance={user?.creditsBalance || creditBalance || 0}
        onPurchaseStart={() => {
          // Save order data to localStorage before redirecting to Stripe
          localStorage.setItem("printOrderFormData", JSON.stringify(orderData));
        }}
      />
    </div>
  );
};

export default PrintOrderPage;
