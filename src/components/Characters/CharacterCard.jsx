import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { CiUser } from "react-icons/ci";
import { FaEdit, FaTrash, FaDog, FaChild } from "react-icons/fa";
import { deleteCharacter } from "@/stores/reducers/characters";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";

const CharacterCard = ({ character, onEdit, onDelete }) => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false);
  const [usedInBooks, setUsedInBooks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    navigate(`/characters/${character.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(character);
    } else {
      navigate(`/characters/${character.id}/edit`);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteCharacter({
          characterId: character.id,
          force: false,
        })
      );

      if (deleteCharacter.fulfilled.match(result)) {
        toast.success(t("characters.deleteSuccess"));
        setShowDeleteDialog(false);
        if (onDelete) {
          onDelete(character.id);
        }
      } else {
        // Check if it's a confirmation required error
        if (result.payload?.requiresConfirmation) {
          setUsedInBooks(result.payload.usedInBooks || []);
          setShowDeleteDialog(false);
          setShowForceDeleteDialog(true);
        } else {
          const errorMessage = translateError(
            result.payload?.message || t("characters.failedToDeleteCharacter")
          );
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      logger.error("Delete character error:", error);
      const errorMessage = translateError(
        error?.message || t("characters.failedToDeleteCharacter")
      );
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteCharacter({
          characterId: character.id,
          force: true,
        })
      );

      if (deleteCharacter.fulfilled.match(result)) {
        toast.success(t("characters.deleteSuccess"));
        setShowForceDeleteDialog(false);
        if (onDelete) {
          onDelete(character.id);
        }
      } else {
        const errorMessage = translateError(
          result.payload?.message || t("characters.failedToDeleteCharacter")
        );
        toast.error(errorMessage);
      }
    } catch (error) {
      logger.error("Force delete character error:", error);
      const errorMessage = translateError(
        error?.message || t("characters.failedToDeleteCharacter")
      );
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCharacterIcon = () => {
    if (character.characterType === "pet") {
      return <FaDog className="h-4 w-4" />;
    }
    return <FaChild className="h-4 w-4" />;
  };

  const getCharacterTypeLabel = () => {
    return character.characterType === "pet"
      ? t("characters.pet")
      : t("characters.human");
  };

  const getCharacterImage = () => {
    // Reference images are supported for all character types
    if (character.referenceImageUrl) {
      return character.referenceImageUrl;
    }
    return null;
  };

  const getCharacterDisplayInfo = () => {
    if (character.characterType === "human") {
      const info = [];
      if (character.age)
        info.push(`${character.age} ${t("characters.yearsOld")}`);
      if (character.gender) info.push(t(`characters.${character.gender}`));
      return info.join(" • ");
    } else {
      const info = [];
      if (character.petType) info.push(character.petType);
      if (character.breed) info.push(character.breed);
      return info.join(" • ");
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full"
        onClick={handleCardClick}
      >
        <CardBody className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getCharacterIcon()}
              <Typography variant="small" className="text-gray-600">
                {getCharacterTypeLabel()}
              </Typography>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="text"
                className="p-2 min-w-0"
                onClick={handleEditClick}
              >
                <FaEdit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="text"
                color="red"
                className="p-2 min-w-0"
                onClick={handleDeleteClick}
              >
                <FaTrash className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Character Image/Avatar */}
            <div className="mb-3">
              {getCharacterImage() ? (
                <Avatar
                  variant="rounded"
                  alt={character.characterName}
                  className="h-16 w-16"
                  src={getCharacterImage()}
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  {character.characterType === "pet" ? (
                    <FaDog className="h-8 w-8 text-gray-600" />
                  ) : (
                    <FaChild className="h-8 w-8 text-gray-600" />
                  )}
                </div>
              )}
            </div>

            {/* Character Name */}
            <Typography variant="h6" className="text-gray-900 mb-1">
              {character.characterName}
            </Typography>

            {/* Character Info */}
            <Typography variant="small" className="text-gray-600 mb-2">
              {getCharacterDisplayInfo()}
            </Typography>

            {/* Personality (if exists) */}
            {character.personality && (
              <Typography
                variant="small"
                className="text-gray-500 text-center line-clamp-2"
              >
                {character.personality}
              </Typography>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        handler={() => setShowDeleteDialog(false)}
      >
        <DialogHeader>{t("characters.deleteConfirmTitle")}</DialogHeader>
        <DialogBody>
          <Typography>
            {t("characters.deleteConfirmMessage", {
              name: character.characterName,
            })}
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setShowDeleteDialog(false)}
            className="mr-1"
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Force Delete Dialog (when character is used in books) */}
      <Dialog
        open={showForceDeleteDialog}
        handler={() => setShowForceDeleteDialog(false)}
      >
        <DialogHeader>{t("characters.forceDeleteTitle")}</DialogHeader>
        <DialogBody>
          <Typography className="mb-4">
            {t("characters.characterUsedInBooks", {
              name: character.characterName,
            })}
          </Typography>
          {usedInBooks.length > 0 && (
            <div className="mb-4">
              <Typography variant="small" className="font-semibold mb-2">
                {t("characters.usedInBooksLabel")}:
              </Typography>
              <ul className="list-disc list-inside">
                {usedInBooks.map((bookTitle, index) => (
                  <li key={index}>
                    <Typography variant="small">{bookTitle}</Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Typography color="red">
            {t("characters.forceDeleteWarning")}
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setShowForceDeleteDialog(false)}
            className="mr-1"
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleForceDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("characters.forceDelete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default CharacterCard;
