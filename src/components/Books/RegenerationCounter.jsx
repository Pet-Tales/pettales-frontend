import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Typography, Tooltip } from "@material-tailwind/react";
import { FaRedo, FaInfoCircle } from "react-icons/fa";

/**
 * Component to display the remaining free regenerations for a book
 * @param {Object} props - Component props
 * @param {number} props.pageCount - Book page count (12, 16, or 24)
 * @param {number} props.regenerationsUsed - Number of regenerations already used
 * @param {boolean} props.showLabel - Whether to show the label text
 * @param {string} props.className - Additional CSS classes
 */
const RegenerationCounter = ({ 
  pageCount, 
  regenerationsUsed = 0, 
  showLabel = true,
  className = ""
}) => {
  const { t } = useValidatedTranslation();
  
  // Free regeneration limits based on page count
  const FREE_REGENERATION_LIMITS = {
    12: 3, // 12-page book: 3 free regenerations
    16: 4, // 16-page book: 4 free regenerations
    24: 5, // 24-page book: 5 free regenerations
  };
  
  const freeLimit = FREE_REGENERATION_LIMITS[pageCount] || 0;
  const remainingFree = Math.max(0, freeLimit - regenerationsUsed);
  const hasExceededLimit = remainingFree === 0;
  
  // Determine color based on remaining count
  const getStatusColor = () => {
    if (hasExceededLimit) return "text-red-500";
    if (remainingFree === 1) return "text-orange-500";
    return "text-green-500";
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <Typography variant="small" className="text-gray-700">
          {t("books.freeRegenerations")}:
        </Typography>
      )}
      
      <div className="flex items-center gap-1">
        <FaRedo className={`h-3.5 w-3.5 ${getStatusColor()}`} />
        <Typography 
          variant="small" 
          className={`font-medium ${getStatusColor()}`}
        >
          {remainingFree}/{freeLimit}
        </Typography>
      </div>
      
      <Tooltip
        content={
          hasExceededLimit
            ? t("books.regenerationTooltip.exceeded", { cost: 16 })
            : t("books.regenerationTooltip.available", { 
                remaining: remainingFree,
                cost: 16
              })
        }
      >
        <FaInfoCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
      </Tooltip>
    </div>
  );
};

export default RegenerationCounter;
