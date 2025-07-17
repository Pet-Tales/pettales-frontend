import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Chip } from "@material-tailwind/react";
import {
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const BookStatusBadge = ({ status, size = "sm" }) => {
  const { t } = useValidatedTranslation();

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "amber",
          icon: FaClock,
          label: t("books.status.pending"),
        };
      case "generating":
        return {
          color: "blue",
          icon: FaSpinner,
          label: t("books.status.generating"),
          animate: true,
        };
      case "completed":
        return {
          color: "green",
          icon: FaCheckCircle,
          label: t("books.status.completed"),
        };
      case "failed":
        return {
          color: "red",
          icon: FaExclamationTriangle,
          label: t("books.status.failed"),
        };
      default:
        return {
          color: "gray",
          icon: FaClock,
          label: t("books.status.unknown"),
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Chip
      size={size}
      color={config.color}
      value={
        <div className="flex items-center gap-1">
          <Icon
            className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`}
          />
          <span className="text-xs font-medium">{config.label}</span>
        </div>
      }
      className="rounded-full"
    />
  );
};

export default BookStatusBadge;
