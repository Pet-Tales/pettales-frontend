import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaExclamationTriangle } from "react-icons/fa";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, bookTitle }) => {
  const { t } = useValidatedTranslation();

  return (
    <Dialog open={isOpen} handler={onClose} size="sm">
      <DialogHeader className="flex items-center gap-3">
        <FaExclamationTriangle className="h-6 w-6 text-red-500" />
        <Typography variant="h5">
          {t("books.deleteConfirmation.title")}
        </Typography>
      </DialogHeader>
      
      <DialogBody>
        <Typography className="text-gray-700">
          {t("books.deleteConfirmation.message", { title: bookTitle })}
        </Typography>
        <Typography className="text-gray-600 mt-2 text-sm">
          {t("books.deleteConfirmation.warning")}
        </Typography>
      </DialogBody>
      
      <DialogFooter className="flex gap-2">
        <Button
          variant="outlined"
          color="gray"
          onClick={onClose}
          className="flex-1"
        >
          {t("common.cancel")}
        </Button>
        <Button
          variant="filled"
          color="red"
          onClick={onConfirm}
          className="flex-1"
        >
          {t("books.delete")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
