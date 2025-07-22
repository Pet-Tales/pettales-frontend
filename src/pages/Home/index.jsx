import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Button,
  Card,
  CardBody,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Input,
  Textarea,
} from "@material-tailwind/react";
import {
  FaBook,
  FaPalette,
  FaUsers,
  FaDownload,
  FaGlobe,
  FaPrint,
  FaHeart,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaCheck,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import GalleryService from "@/services/galleryService";
import ContactService from "@/services/contactService";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";
import { toast } from "react-toastify";

const Home = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const translateError = useErrorTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactFormErrors, setContactFormErrors] = useState({});

  // Load featured books for social proof
  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  // Handle hash navigation to sections
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#faq") {
      setTimeout(() => {
        const faqSection = document.getElementById("faq-section");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure page is fully loaded
    } else if (hash === "#how-it-works") {
      setTimeout(() => {
        const howItWorksSection = document.getElementById(
          "how-it-works-section"
        );
        if (howItWorksSection) {
          howItWorksSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else if (hash === "#contact") {
      setTimeout(() => {
        const contactSection = document.getElementById("contact-section");
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      setIsLoadingFeatured(true);
      const response = await GalleryService.getFeaturedBooks(6);
      setFeaturedBooks(response.data.data.books);
    } catch (error) {
      logger.error("Load featured books error:", error);
      // Don't show error toast on landing page, just log it
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/my-books");
    } else {
      navigate("/signup");
    }
  };

  const handleViewGallery = () => {
    navigate("/gallery");
  };

  const handleViewPricing = () => {
    navigate("/pricing");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFaqOpen = (value) => {
    setOpenFaq(openFaq === value ? 0 : value);
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (contactFormErrors[field]) {
      setContactFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateContactForm = () => {
    const errors = {};

    // Name validation
    if (!contactForm.name.trim()) {
      errors.name = t("landing.contact.validation.nameRequired");
    } else if (contactForm.name.trim().length > 100) {
      errors.name = t("landing.contact.validation.nameTooLong");
    }

    // Email validation
    if (!contactForm.email.trim()) {
      errors.email = t("landing.contact.validation.emailRequired");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactForm.email.trim())) {
        errors.email = t("landing.contact.validation.emailInvalid");
      }
    }

    // Subject validation
    if (!contactForm.subject.trim()) {
      errors.subject = t("landing.contact.validation.subjectRequired");
    } else if (contactForm.subject.trim().length > 200) {
      errors.subject = t("landing.contact.validation.subjectTooLong");
    }

    // Message validation
    if (!contactForm.message.trim()) {
      errors.message = t("landing.contact.validation.messageRequired");
    } else if (contactForm.message.trim().length < 10) {
      errors.message = t("landing.contact.validation.messageTooShort");
    } else if (contactForm.message.trim().length > 2000) {
      errors.message = t("landing.contact.validation.messageTooLong");
    }

    setContactFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setContactFormErrors({});

    // Validate form on frontend first
    if (!validateContactForm()) {
      toast.error(t("landing.contact.validation.pleaseFixErrors"));
      return;
    }

    setIsSubmittingContact(true);

    try {
      // Get user's language preference
      const language = localStorage.getItem("language") || "en";

      // Submit contact form via API
      const response = await ContactService.submitContactForm({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        language,
      });

      if (response.data.success) {
        // Reset form and errors
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setContactFormErrors({});

        // Show success message with status code
        toast.success(
          `${t("landing.contact.successMessage")} (${response.status})`
        );

        logger.info("Contact form submitted successfully", {
          status: response.status,
          message: response.data.message,
        });
      } else {
        // Show error message from server with status code
        toast.error(
          `${response.data.message || t("landing.contact.errorMessage")} (${
            response.status
          })`
        );
      }
    } catch (error) {
      logger.error("Contact form submission error:", error);

      const status = error.response?.status || "Network Error";

      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;

        // Map backend errors to frontend form errors
        const mappedErrors = {};
        backendErrors.forEach((err) => {
          if (err.path) {
            mappedErrors[err.path] = err.msg;
          }
        });

        if (Object.keys(mappedErrors).length > 0) {
          setContactFormErrors(mappedErrors);
          toast.error(
            `${t(
              "landing.contact.validation.serverValidationFailed"
            )} (${status})`
          );
        } else {
          toast.error(
            `${
              error.response.data.message || t("landing.contact.errorMessage")
            } (${status})`
          );
        }
      } else if (error.response?.status === 500) {
        // Server error
        toast.error(`${t("landing.contact.serverError")} (${status})`);
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        // Network error
        toast.error(`${t("landing.contact.networkError")} (Network Error)`);
      } else {
        // Other errors
        const errorMessage = translateError(
          error?.response?.data?.message || error
        );
        toast.error(`${errorMessage} (${status})`);
      }
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <Typography
                variant="h1"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
              >
                {t("landing.hero.title")}
              </Typography>
              <Typography variant="lead" className="text-xl text-gray-600 mb-8">
                {t("landing.hero.subtitle")}
              </Typography>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                  onClick={handleGetStarted}
                >
                  <FaBook className="h-5 w-5" />
                  {t("landing.hero.primaryCta")}
                </Button>
                <Button
                  size="lg"
                  variant="outlined"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2"
                  onClick={handleViewGallery}
                >
                  <FaArrowRight className="h-4 w-4" />
                  {t("landing.hero.secondaryCta")}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FaCheck className="h-4 w-4 text-green-500" />
                  {t("landing.hero.trustIndicator1")}
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="h-4 w-4 text-green-500" />
                  {t("landing.hero.trustIndicator2")}
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="h-4 w-4 text-green-500" />
                  {t("landing.hero.trustIndicator3")}
                </div>
              </div>
            </div>

            {/* Hero Image/Video Placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FaPlay className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <Typography variant="h6" className="text-gray-500">
                    {t("landing.hero.videoPlaceholder")}
                  </Typography>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-3 rounded-full shadow-lg">
                <FaStar className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-pink-400 text-white p-3 rounded-full shadow-lg">
                <FaHeart className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {t("landing.features.title")}
            </Typography>
            <Typography
              variant="lead"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {t("landing.features.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: AI-Powered Storytelling */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBook className="h-8 w-8 text-indigo-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature1.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature1.description")}
                </Typography>
              </CardBody>
            </Card>

            {/* Feature 2: Beautiful Illustrations */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPalette className="h-8 w-8 text-pink-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature2.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature2.description")}
                </Typography>
              </CardBody>
            </Card>

            {/* Feature 3: Character Creation */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="h-8 w-8 text-green-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature3.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature3.description")}
                </Typography>
              </CardBody>
            </Card>

            {/* Feature 4: Multiple Languages */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGlobe className="h-8 w-8 text-blue-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature4.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature4.description")}
                </Typography>
              </CardBody>
            </Card>

            {/* Feature 5: Print-Ready PDFs */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDownload className="h-8 w-8 text-yellow-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature5.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature5.description")}
                </Typography>
              </CardBody>
            </Card>

            {/* Feature 6: Professional Quality */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardBody>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPrint className="h-8 w-8 text-purple-600" />
                </div>
                <Typography variant="h5" className="text-gray-900 mb-3">
                  {t("landing.features.feature6.title")}
                </Typography>
                <Typography className="text-gray-600">
                  {t("landing.features.feature6.description")}
                </Typography>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works-section"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {t("landing.howItWorks.title")}
            </Typography>
            <Typography
              variant="lead"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {t("landing.howItWorks.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Typography variant="h4" className="text-white font-bold">
                    1
                  </Typography>
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <FaUsers className="h-12 w-12 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                {t("landing.howItWorks.step1.title")}
              </Typography>
              <Typography className="text-gray-600 text-sm">
                {t("landing.howItWorks.step1.description")}
              </Typography>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Typography variant="h4" className="text-white font-bold">
                    2
                  </Typography>
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <FaBook className="h-12 w-12 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                {t("landing.howItWorks.step2.title")}
              </Typography>
              <Typography className="text-gray-600 text-sm">
                {t("landing.howItWorks.step2.description")}
              </Typography>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Typography variant="h4" className="text-white font-bold">
                    3
                  </Typography>
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <FaStar className="h-12 w-12 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                {t("landing.howItWorks.step3.title")}
              </Typography>
              <Typography className="text-gray-600 text-sm">
                {t("landing.howItWorks.step3.description")}
              </Typography>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Typography variant="h4" className="text-white font-bold">
                    4
                  </Typography>
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <FaDownload className="h-12 w-12 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                {t("landing.howItWorks.step4.title")}
              </Typography>
              <Typography className="text-gray-600 text-sm">
                {t("landing.howItWorks.step4.description")}
              </Typography>
            </div>

            {/* Step 5 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Typography variant="h4" className="text-white font-bold">
                    5
                  </Typography>
                </div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
                <FaPrint className="h-12 w-12 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                {t("landing.howItWorks.step5.title")}
              </Typography>
              <Typography className="text-gray-600 text-sm">
                {t("landing.howItWorks.step5.description")}
              </Typography>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleGetStarted}
            >
              {t("landing.howItWorks.cta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {t("landing.socialProof.title")}
            </Typography>
            <Typography
              variant="lead"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {t("landing.socialProof.subtitle")}
            </Typography>
          </div>

          {/* Featured Books */}
          {isLoadingFeatured ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredBooks.slice(0, 6).map((book) => (
                <Card
                  key={book.id}
                  className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
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
                  <CardBody className="p-4">
                    <Typography variant="h6" className="mb-2 line-clamp-2">
                      {book.title}
                    </Typography>
                    <Typography className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {book.description}
                    </Typography>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {book.userId?.firstName} {book.userId?.lastName}
                      </span>
                      <span>{formatDate(book.createdAt)}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-4-3-container bg-gray-200 rounded-t-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <FaBook className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <Typography variant="small" className="text-gray-500">
                        {t("landing.socialProof.bookPlaceholder")}
                      </Typography>
                    </div>
                  </div>
                  <CardBody className="p-4">
                    <Typography variant="h6" className="mb-2">
                      {t("landing.socialProof.sampleTitle")} {i}
                    </Typography>
                    <Typography className="text-gray-600 text-sm mb-2">
                      {t("landing.socialProof.sampleDescription")}
                    </Typography>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{t("landing.socialProof.sampleAuthor")}</span>
                      <span>{formatDate(new Date())}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* View Gallery CTA */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outlined"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={handleViewGallery}
            >
              {t("landing.socialProof.viewGalleryCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq-section"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {t("landing.faq.title")}
            </Typography>
            <Typography
              variant="lead"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {t("landing.faq.subtitle")}
            </Typography>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <Accordion open={openFaq === 1}>
              <AccordionHeader
                onClick={() => handleFaqOpen(1)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question1")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer1")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 2 */}
            <Accordion open={openFaq === 2}>
              <AccordionHeader
                onClick={() => handleFaqOpen(2)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question2")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer2")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 3 */}
            <Accordion open={openFaq === 3}>
              <AccordionHeader
                onClick={() => handleFaqOpen(3)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question3")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer3")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 4 */}
            <Accordion open={openFaq === 4}>
              <AccordionHeader
                onClick={() => handleFaqOpen(4)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question4")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer4")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 5 */}
            <Accordion open={openFaq === 5}>
              <AccordionHeader
                onClick={() => handleFaqOpen(5)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question5")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer5")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 6 */}
            <Accordion open={openFaq === 6}>
              <AccordionHeader
                onClick={() => handleFaqOpen(6)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question6")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer6")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 7 */}
            <Accordion open={openFaq === 7}>
              <AccordionHeader
                onClick={() => handleFaqOpen(7)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question7")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer7")}
              </AccordionBody>
            </Accordion>

            {/* FAQ 8 */}
            <Accordion open={openFaq === 8}>
              <AccordionHeader
                onClick={() => handleFaqOpen(8)}
                className="text-left hover:text-indigo-600 transition-colors"
              >
                {t("landing.faq.question8")}
              </AccordionHeader>
              <AccordionBody className="text-gray-600 text-base">
                {t("landing.faq.answer8")}
              </AccordionBody>
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <Typography variant="h6" className="text-gray-900 mb-4">
              {t("landing.faq.stillHaveQuestions")}
            </Typography>
            <Button
              variant="outlined"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={() => {
                const contactSection =
                  document.getElementById("contact-section");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {t("landing.faq.contactUs")}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section
        id="contact-section"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              {t("landing.contact.title")}
            </Typography>
            <Typography
              variant="lead"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              {t("landing.contact.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <Typography variant="h4" className="text-gray-900 mb-6">
                {t("landing.contact.getInTouch")}
              </Typography>
              <Typography className="text-gray-600 mb-8">
                {t("landing.contact.description")}
              </Typography>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBook className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <Typography variant="h6" className="text-gray-900 mb-2">
                      {t("landing.contact.support.title")}
                    </Typography>
                    <Typography className="text-gray-600">
                      {t("landing.contact.support.description")}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaUsers className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <Typography variant="h6" className="text-gray-900 mb-2">
                      {t("landing.contact.community.title")}
                    </Typography>
                    <Typography className="text-gray-600">
                      {t("landing.contact.community.description")}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaStar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <Typography variant="h6" className="text-gray-900 mb-2">
                      {t("landing.contact.feedback.title")}
                    </Typography>
                    <Typography className="text-gray-600">
                      {t("landing.contact.feedback.description")}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-6">
              <CardBody>
                <Typography variant="h5" className="text-gray-900 mb-6">
                  {t("landing.contact.form.title")}
                </Typography>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Input
                        label={t("landing.contact.form.name")}
                        value={contactForm.name}
                        onChange={(e) =>
                          handleContactFormChange("name", e.target.value)
                        }
                        required
                        disabled={isSubmittingContact}
                        error={!!contactFormErrors.name}
                      />
                      {contactFormErrors.name && (
                        <Typography
                          variant="small"
                          className="text-red-500 mt-1"
                        >
                          {contactFormErrors.name}
                        </Typography>
                      )}
                    </div>
                    <div>
                      <Input
                        type="email"
                        label={t("landing.contact.form.email")}
                        value={contactForm.email}
                        onChange={(e) =>
                          handleContactFormChange("email", e.target.value)
                        }
                        required
                        disabled={isSubmittingContact}
                        error={!!contactFormErrors.email}
                      />
                      {contactFormErrors.email && (
                        <Typography
                          variant="small"
                          className="text-red-500 mt-1"
                        >
                          {contactFormErrors.email}
                        </Typography>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      label={t("landing.contact.form.subject")}
                      value={contactForm.subject}
                      onChange={(e) =>
                        handleContactFormChange("subject", e.target.value)
                      }
                      required
                      disabled={isSubmittingContact}
                      error={!!contactFormErrors.subject}
                    />
                    {contactFormErrors.subject && (
                      <Typography variant="small" className="text-red-500 mt-1">
                        {contactFormErrors.subject}
                      </Typography>
                    )}
                  </div>

                  <div>
                    <Textarea
                      label={t("landing.contact.form.message")}
                      value={contactForm.message}
                      onChange={(e) =>
                        handleContactFormChange("message", e.target.value)
                      }
                      rows={5}
                      required
                      disabled={isSubmittingContact}
                      error={!!contactFormErrors.message}
                    />
                    {contactFormErrors.message && (
                      <Typography variant="small" className="text-red-500 mt-1">
                        {contactFormErrors.message}
                      </Typography>
                    )}
                    <Typography variant="small" className="text-gray-500 mt-1">
                      {contactForm.message.length}/2000{" "}
                      {t("landing.contact.form.characters")}
                    </Typography>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact
                      ? t("landing.contact.form.sending")
                      : t("landing.contact.form.send")}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <Typography
            variant="h2"
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {t("landing.finalCta.title")}
          </Typography>
          <Typography variant="lead" className="text-xl text-indigo-100 mb-8">
            {t("landing.finalCta.subtitle")}
          </Typography>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-50"
              onClick={handleGetStarted}
            >
              {t("landing.finalCta.primaryCta")}
            </Button>
            <Button
              size="lg"
              variant="outlined"
              className="border-white text-white hover:bg-indigo-700"
              onClick={handleViewGallery}
            >
              {t("landing.finalCta.secondaryCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Column 1: Social Media */}
            <div className="text-center md:text-left">
              <Typography variant="h5" className="text-white mb-6">
                {t("footer.social.title")}
              </Typography>
              <Typography className="text-gray-300 mb-6">
                {t("footer.social.description")}
              </Typography>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors duration-300"
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Column 2: Site Map */}
            <div className="text-center md:text-left">
              <Typography variant="h5" className="text-white mb-6">
                {t("footer.sitemap.title")}
              </Typography>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.sitemap.home")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleViewGallery}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.sitemap.gallery")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleViewPricing}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.sitemap.pricing")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (window.location.pathname === "/") {
                        const howItWorksSection = document.getElementById(
                          "how-it-works-section"
                        );
                        if (howItWorksSection) {
                          howItWorksSection.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      } else {
                        navigate("/#how-it-works");
                      }
                    }}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.sitemap.howItWorks")}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal Pages */}
            <div className="text-center md:text-left">
              <Typography variant="h5" className="text-white mb-6">
                {t("footer.legal.title")}
              </Typography>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigate("/privacy-policy")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.legal.privacyPolicy")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms-of-service")}
                    className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {t("footer.legal.termsOfService")}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <Typography variant="h6" className="text-white mb-2">
                  PetTalesAI
                </Typography>
                <Typography className="text-gray-400 text-sm">
                  {t("footer.bottom.copyright")}
                </Typography>
              </div>
              <div className="text-center md:text-right">
                <Typography className="text-gray-400 text-sm">
                  {t("footer.bottom.madeWith")} ❤️{" "}
                  {t("footer.bottom.forPetLovers")}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
