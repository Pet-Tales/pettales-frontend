import { Alert, Typography } from "@material-tailwind/react";
import { FaExclamationTriangle } from "react-icons/fa";

const InlineAlert = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <Alert
      color="red"
      className="mb-4 flex items-center gap-2"
      dismissible
      onClose={onClose}
    >
      <div className="flex gap-2">
        <FaExclamationTriangle className="h-4 w-4 self-center" />
        <Typography variant="small" className="font-medium">
          {message}
        </Typography>
      </div>
    </Alert>
  );
};

export default InlineAlert;
