import { useState, useEffect } from "react";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Typography,
  Input,
  Select,
  Option,
  Button,
  Spinner,
  Alert,
} from "@material-tailwind/react";
import { FaArrowRight } from "react-icons/fa";
import countryList from "react-select-country-list";

// Postal code validation patterns for different countries
const postalCodePatterns = {
  US: { pattern: /^\d{5}(-\d{4})?$/, example: "12345 or 12345-6789" },
  CA: { pattern: /^[A-Z]\d[A-Z] \d[A-Z]\d$/, example: "A1A 1A1" },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i, example: "SW1A 1AA" },
  DE: { pattern: /^\d{5}$/, example: "12345" },
  FR: { pattern: /^\d{5}$/, example: "75001" },
  PL: { pattern: /^\d{2}-\d{3}$/, example: "00-950" },
  AU: { pattern: /^\d{4}$/, example: "2000" },
  JP: { pattern: /^\d{3}-\d{4}$/, example: "100-0001" },
  // Add more countries as needed
};

const validatePostalCode = (postcode, countryCode) => {
  const pattern = postalCodePatterns[countryCode];

  if (!pattern) {
    // If we don't have a pattern for this country, allow any format
    return { isValid: true };
  }

  const isValid = pattern.pattern.test(postcode);

  return {
    isValid,
    message: isValid
      ? null
      : `Postal code should be in format: ${pattern.example}`,
  };
};

const ShippingAddressForm = ({
  orderData,
  updateOrderData,
  onNext,
  loading,
  apiError,
  onClearError,
}) => {
  const { t } = useValidatedTranslation();
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // Initialize countries list
  useEffect(() => {
    const countryOptions = countryList().getData();
    console.log("Countries loaded:", countryOptions.length);
    console.log(
      "Current country_code:",
      orderData.shippingAddress.country_code
    );
    setCountries(countryOptions);
  }, []);

  // US states for state selection
  const usStates = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ];

  // Update states when country changes
  useEffect(() => {
    if (orderData.shippingAddress.country_code === "US") {
      setStates(usStates);
    } else {
      setStates([]);
      // Clear state code if not US
      if (orderData.shippingAddress.state_code) {
        updateOrderData({
          shippingAddress: {
            ...orderData.shippingAddress,
            state_code: "",
          },
        });
      }
    }
  }, [orderData.shippingAddress.country_code]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log(`handleInputChange called: ${field} = ${value}`);

    updateOrderData({
      shippingAddress: {
        ...orderData.shippingAddress,
        [field]: value,
      },
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }

    // Clear API error when user makes changes
    if (apiError && onClearError) {
      onClearError();
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const quantity = parseInt(value) || 1;
    updateOrderData({ quantity: Math.max(1, Math.min(100, quantity)) });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const { shippingAddress } = orderData;

    if (!shippingAddress.name.trim()) {
      newErrors.name = t("printOrder.validation.nameRequired");
    }

    if (!shippingAddress.street1.trim()) {
      newErrors.street1 = t("printOrder.validation.street1Required");
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = t("printOrder.validation.cityRequired");
    }

    if (!shippingAddress.postcode.trim()) {
      newErrors.postcode = t("printOrder.validation.postcodeRequired");
    } else {
      // Validate postal code format based on country
      const postcodeValidation = validatePostalCode(
        shippingAddress.postcode,
        shippingAddress.country_code
      );
      if (!postcodeValidation.isValid) {
        newErrors.postcode = postcodeValidation.message;
      }
    }

    if (!shippingAddress.country_code) {
      newErrors.country_code = t("printOrder.validation.countryRequired");
    }

    if (!shippingAddress.phone_number.trim()) {
      newErrors.phone_number = t("printOrder.validation.phoneRequired");
    } else if (
      !/^[\+]?[\d\s\-\.\(\)]{8,20}$/.test(shippingAddress.phone_number)
    ) {
      newErrors.phone_number = t("printOrder.validation.phoneInvalid");
    }

    if (!shippingAddress.email.trim()) {
      newErrors.email = t("printOrder.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = t("printOrder.validation.emailInvalid");
    }

    // State validation for US addresses
    if (shippingAddress.country_code === "US" && !shippingAddress.state_code) {
      newErrors.state_code = t("printOrder.validation.stateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Typography variant="h5" className="mb-4">
          {t("printOrder.shipping.title")}
        </Typography>
        <Typography variant="small" className="text-gray-600 mb-6">
          {t("printOrder.shipping.description")}
        </Typography>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <Alert color="red" className="mb-6">
          <Typography variant="small" className="font-medium">
            {apiError}
          </Typography>
        </Alert>
      )}

      {/* Quantity */}
      <div>
        <Typography variant="small" className="mb-2 font-medium">
          {t("printOrder.quantity")}
        </Typography>
        <Input
          type="number"
          min="1"
          max="100"
          value={orderData.quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="w-32"
        />
      </div>

      {/* Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label={t("printOrder.shipping.name")}
            value={orderData.shippingAddress.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            required
          />
          {errors.name && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.name}
            </Typography>
          )}
        </div>

        <div className="md:col-span-2">
          <Input
            label={t("printOrder.shipping.street1")}
            value={orderData.shippingAddress.street1}
            onChange={(e) => handleInputChange("street1", e.target.value)}
            error={!!errors.street1}
            required
          />
          {errors.street1 && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.street1}
            </Typography>
          )}
        </div>

        <div className="md:col-span-2">
          <Input
            label={t("printOrder.shipping.street2")}
            value={orderData.shippingAddress.street2}
            onChange={(e) => handleInputChange("street2", e.target.value)}
          />
        </div>

        <div>
          <Input
            label={t("printOrder.shipping.city")}
            value={orderData.shippingAddress.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            error={!!errors.city}
            required
          />
          {errors.city && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.city}
            </Typography>
          )}
        </div>

        <div>
          <Input
            label={t("printOrder.shipping.postcode")}
            value={orderData.shippingAddress.postcode}
            onChange={(e) => handleInputChange("postcode", e.target.value)}
            error={!!errors.postcode}
            required
          />
          {errors.postcode && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.postcode}
            </Typography>
          )}
        </div>

        <div>
          <Select
            label={t("printOrder.shipping.country")}
            value={orderData.shippingAddress.country_code || ""}
            onChange={(value) => handleInputChange("country_code", value)}
            error={!!errors.country_code}
            key={`country-${orderData.shippingAddress.country_code}`} // Force re-render when value changes
          >
            {countries.map((country) => (
              <Option key={country.value} value={country.value}>
                {country.label}
              </Option>
            ))}
          </Select>
          {errors.country_code && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.country_code}
            </Typography>
          )}
        </div>

        {orderData.shippingAddress.country_code === "US" && (
          <div>
            <Select
              label={t("printOrder.shipping.state")}
              value={orderData.shippingAddress.state_code || ""}
              onChange={(value) => handleInputChange("state_code", value)}
              error={!!errors.state_code}
              key={`state-${orderData.shippingAddress.state_code}`} // Force re-render when value changes
            >
              {states.map((state) => (
                <Option key={state.value} value={state.value}>
                  {state.label}
                </Option>
              ))}
            </Select>
            {errors.state_code && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.state_code}
              </Typography>
            )}
          </div>
        )}

        <div>
          <Input
            label={t("printOrder.shipping.phone")}
            value={orderData.shippingAddress.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            error={!!errors.phone_number}
            required
          />
          {errors.phone_number && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.phone_number}
            </Typography>
          )}
        </div>

        <div>
          <Input
            label={t("printOrder.shipping.email")}
            type="email"
            value={orderData.shippingAddress.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!errors.email}
            required
          />
          {errors.email && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.email}
            </Typography>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <FaArrowRight className="h-4 w-4" />
          )}
          {loading ? t("common.loading") : t("common.next")}
        </Button>
      </div>
    </form>
  );
};

export default ShippingAddressForm;
