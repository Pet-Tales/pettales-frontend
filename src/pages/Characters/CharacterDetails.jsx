import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { CiUser } from "react-icons/ci";
import { FaEdit, FaTrash, FaDog, FaChild, FaArrowLeft } from "react-icons/fa";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  fetchCharacterById,
  deleteCharacter,
  clearCurrentCharacter,
} from "@/stores/reducers/characters";
import { useErrorTranslation } from "@/utils/errorMapper";
import logger from "@/utils/logger";

const CharacterDetails = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();
  const { id } = useParams();

  const { currentCharacter, isLoading, isDeleting } = useSelector(
    (state) => state.characters
  );
  const [characterNotFound, setCharacterNotFound] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false);
  const [usedInBooks, setUsedInBooks] = useState([]);

  // Load character data
  useEffect(() => {
    if (id) {
      dispatch(fetchCharacterById(id)).then((result) => {
        if (fetchCharacterById.rejected.match(result)) {
          const status = result.payload?.status;
          const errorMessage = result.payload?.message || "Character not found";

          // Redirect to appropriate error page based on status
          if (status === 404) {
            navigate("/404", { replace: true });
          } else if (status >= 500) {
            navigate("/error/500", { replace: true });
          } else if (status === 400) {
            // Invalid character ID format - redirect to 404
            navigate("/404", { replace: true });
          } else {
            // For other errors, show toast and set not found state
            setCharacterNotFound(true);
            const translatedError = translateError(errorMessage);
            toast.error(translatedError);
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentCharacter());
    };
  }, [id, dispatch, navigate]); // Removed translateError from dependencies

  const handleEdit = () => {
    navigate(`/characters/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await dispatch(
        deleteCharacter({
          characterId: id,
          force: false,
        })
      );

      if (deleteCharacter.fulfilled.match(result)) {
        toast.success(t("characters.deleteSuccess"));
        navigate("/characters");
      } else {
        // Check if it's a confirmation required error
        if (result.payload?.requiresConfirmation) {
          setUsedInBooks(result.payload.usedInBooks || []);
          setShowDeleteDialog(false);
          setShowForceDeleteDialog(true);
        } else {
          const errorMessage = translateError(
            result.payload?.message || "Failed to delete character"
          );
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      logger.error("Delete character error:", error);
      const errorMessage = translateError(
        error?.message || "Failed to delete character"
      );
      toast.error(errorMessage);
    }
  };

  const handleForceDeleteConfirm = async () => {
    try {
      const result = await dispatch(
        deleteCharacter({
          characterId: id,
          force: true,
        })
      );

      if (deleteCharacter.fulfilled.match(result)) {
        toast.success(t("characters.deleteSuccess"));
        navigate("/characters");
      } else {
        const errorMessage = translateError(
          result.payload?.message || "Failed to delete character"
        );
        toast.error(errorMessage);
      }
    } catch (error) {
      logger.error("Force delete character error:", error);
      const errorMessage = translateError(
        error?.message || "Failed to delete character"
      );
      toast.error(errorMessage);
    }
  };

  const getCharacterIcon = () => {
    if (currentCharacter?.characterType === "pet") {
      return <FaDog className="h-5 w-5" />;
    }
    return <FaChild className="h-5 w-5" />;
  };

  const getCharacterTypeLabel = () => {
    return currentCharacter?.characterType === "pet"
      ? t("characters.pet")
      : t("characters.human");
  };

  const getCharacterImage = () => {
    // Reference images are now supported for both human and pet characters
    if (currentCharacter?.referenceImageUrl) {
      return currentCharacter.referenceImageUrl;
    }
    return null;
  };

  const renderCharacterInfo = () => {
    if (!currentCharacter) return null;

    if (currentCharacter.characterType === "human") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCharacter.age && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.age")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.age} {t("characters.yearsOld")}
              </Typography>
            </div>
          )}

          {currentCharacter.gender && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.gender")}
              </Typography>
              <Typography className="text-gray-900">
                {t(`characters.${currentCharacter.gender}`)}
              </Typography>
            </div>
          )}

          {currentCharacter.ethnicity && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.ethnicity")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.ethnicity}
              </Typography>
            </div>
          )}

          {currentCharacter.hairColor && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.hairColor")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.hairColor}
              </Typography>
            </div>
          )}

          {currentCharacter.eyeColor && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.eyeColor")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.eyeColor}
              </Typography>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCharacter.petType && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.petType")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.petType}
              </Typography>
            </div>
          )}

          {currentCharacter.breed && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.breed")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.breed}
              </Typography>
            </div>
          )}

          {currentCharacter.fur && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.fur")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.fur}
              </Typography>
            </div>
          )}

          {currentCharacter.ears && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.ears")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.ears}
              </Typography>
            </div>
          )}

          {currentCharacter.tail && (
            <div>
              <Typography
                variant="small"
                className="text-gray-600 font-semibold"
              >
                {t("characters.tail")}
              </Typography>
              <Typography className="text-gray-900">
                {currentCharacter.tail}
              </Typography>
            </div>
          )}
        </div>
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show not found state (only when explicitly set, not when currentCharacter is null during loading)
  if (characterNotFound) {
    return (
      <ProtectedRoute>
        <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <Typography variant="h4" className="text-gray-900 mb-4">
                {t("characters.characterNotFound")}
              </Typography>
              <Typography className="text-gray-600 mb-6">
                {t("characters.characterNotFoundDescription")}
              </Typography>
              <Button
                variant="gradient"
                onClick={() => navigate("/characters")}
                className="flex items-center space-x-2"
              >
                <FaArrowLeft className="h-4 w-4" />
                <span>{t("characters.backToCharacters")}</span>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show loading state if we don't have character data yet (and not in error state)
  if (!currentCharacter && !characterNotFound) {
    return (
      <ProtectedRoute>
        <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate("/characters")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>{t("characters.backToCharacters")}</span>
            </Button>
          </div>

          <Card className="w-full">
            <CardHeader className="bg-custom-light-yellow text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getCharacterIcon()}
                  <div className="flex gap-4">
                    <Typography variant="h4" className="text-white">
                      {currentCharacter.characterName}
                    </Typography>
                    <Chip
                      value={getCharacterTypeLabel()}
                      className="bg-white/20 text-white border-white/30"
                      variant="outlined"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="sm"
                    variant="outlined"
                    className="border-white text-white hover:bg-white hover:text-custom-light-yellow flex gap-0.5"
                    onClick={handleEdit}
                  >
                    <FaEdit className="h-4 w-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="red"
                    className="border-red-300 text-red-300 hover:bg-red-500 hover:text-white flex gap-0.5"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <FaTrash className="h-4 w-4 mr-2" />
                    {isDeleting ? t("common.deleting") : t("common.delete")}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Character Image */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    {getCharacterImage() ? (
                      <Avatar
                        variant="rounded"
                        alt={currentCharacter.characterName}
                        className="h-48 w-48 mx-auto mb-4"
                        src={getCharacterImage()}
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-lg bg-gray-200 flex items-center justify-center mx-auto mb-4">
                        {currentCharacter?.characterType === "pet" ? (
                          <FaDog className="h-24 w-24 text-gray-600" />
                        ) : (
                          <FaChild className="h-24 w-24 text-gray-600" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Character Information */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <Typography variant="h6" className="text-gray-900 mb-4">
                        {t("characters.basicInformation")}
                      </Typography>
                      {renderCharacterInfo()}
                    </div>

                    {/* Personality */}
                    {currentCharacter.personality && (
                      <div>
                        <Typography variant="h6" className="text-gray-900 mb-4">
                          {t("characters.personality")}
                        </Typography>
                        <Typography className="text-gray-700 leading-relaxed">
                          {currentCharacter.personality}
                        </Typography>
                      </div>
                    )}

                    {/* Metadata */}
                    <div>
                      <Typography variant="h6" className="text-gray-900 mb-4">
                        {t("characters.metadata")}
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography
                            variant="small"
                            className="text-gray-600 font-semibold"
                          >
                            {t("characters.createdAt")}
                          </Typography>
                          <Typography className="text-gray-900">
                            {new Date(
                              currentCharacter.createdAt
                            ).toLocaleDateString()}
                          </Typography>
                        </div>

                        <div>
                          <Typography
                            variant="small"
                            className="text-gray-600 font-semibold"
                          >
                            {t("characters.lastUpdated")}
                          </Typography>
                          <Typography className="text-gray-900">
                            {new Date(
                              currentCharacter.updatedAt
                            ).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <div className={showDeleteDialog ? "fixed inset-0 z-50" : "hidden"}>
        <Dialog
          open={showDeleteDialog}
          handler={() => setShowDeleteDialog(false)}
          className="bg-white relative z-60"
        >
          <DialogHeader>{t("characters.deleteConfirmTitle")}</DialogHeader>
          <DialogBody>
            <Typography>
              {t("characters.deleteConfirmMessage", {
                name: currentCharacter?.characterName,
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
      </div>

      {/* Force Delete Dialog */}
      <div className={showForceDeleteDialog ? "fixed inset-0 z-50 " : "hidden"}>
        <Dialog
          open={showForceDeleteDialog}
          handler={() => setShowForceDeleteDialog(false)}
          className="bg-white relative z-60"
        >
          <DialogHeader>{t("characters.forceDeleteTitle")}</DialogHeader>
          <DialogBody>
            <Typography className="mb-4">
              {t("characters.characterUsedInBooks", {
                name: currentCharacter?.characterName,
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
      </div>
    </ProtectedRoute>
  );
};

export default CharacterDetails;
