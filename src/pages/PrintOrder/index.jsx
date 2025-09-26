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
import BookService from "@/services/bookService";
import PrintOrderService from "@/services/printOrderService";
import { smartNavigateBack } from "@/utils/navigationUtils";
import logger from "@/utils/logger";

const PrintOrderPage = () => {
  console.log("PrintOrderPage component rendering");

  const { t } = useValidatedTranslation();
  const { id: bookId } = useParams(); // Extract 'id' parameter and rename it to 'bookId'
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  console.log("PrintOrder params:", { bookId, user: user?.id });

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [book, setBook] = useState(null);
  const [apiError, setApiError] = useState(null);
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
    shippingLevel: "",
  });
  const [costData, setCostData] = useState(null);

  const steps = [
    {
      icon: FaShippingFast,
      title: t("printOrder.steps.shipping"),
    },
    {
      icon: FaClipboardCheck,
      title: t("printOrder.steps.review"),
    },
    {
      icon: FaCheckCircle,
      title: t("printOrder.steps.confirm"),
    },
  ];

  // Restore saved order data after redirect (no credits logic)
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
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
  }, [searchParams, t]);

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

        // Allow if owner OR public
const isOwner  = !!(bookData?.isOwner || (bookData?.userId?.id && user?.id && bookData.userId.id === user.id));
const isPublic = !!(bookData?.isPublic ?? bookData?.is_public);

if (user && !isOwner && !isPublic) {
  toast.error(t("printOrder.errors.unauthorized"));
  navigate(`/books/${bookId}`);
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
      await handleShippingSubmit();
    } else if (currentStep === 1) {
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

  const handleShippingSubmit = async () => {
    try {
      setSubmitting(true);
      setApiError(null);
      setCurrentStep(1);
    } catch (error) {
      logger.error("Failed to proceed to shipping methods:", error);
      setApiError(error.message || t("errors.genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderSubmit = async () => {
    try {
      setSubmitting(true);

      const checkoutResponse = await PrintOrderService.createPrintOrderCheckout({
        bookId,
        quantity: orderData.quantity,
        shippingAddress: orderData.shippingAddress,
        shippingLevel: orderData.shippingLevel,
      });

      if (!checkoutResponse.success) {
        throw new Error(checkoutResponse.message);
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutResponse.data.checkoutUrl;
    } catch (error) {
      logger.error("Failed to create checkout:", error);
      toast.error(error.message || t("printOrder.errors.createCheckout"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderData = (updates) => {
    setOrderData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  console.log("Render state:", { loading, book: !!book });

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
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PrintOrderPage;
