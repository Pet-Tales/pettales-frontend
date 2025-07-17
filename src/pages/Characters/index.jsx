import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Typography, Button, Select, Option } from "@material-tailwind/react";
import { FaFilter } from "react-icons/fa";

import CharacterCard from "@/components/Characters/CharacterCard";
import CreateCharacterCard from "@/components/Characters/CreateCharacterCard";
import {
  fetchCharacters,
  setFilters,
  clearError,
  resetCharacters,
} from "@/stores/reducers/characters";
import { useErrorTranslation } from "@/utils/errorMapper";
import { toast } from "react-toastify";
import logger from "@/utils/logger";

const Characters = () => {
  const { t } = useValidatedTranslation();
  const dispatch = useDispatch();
  const translateError = useErrorTranslation();

  const { characters, pagination, isLoading, isLoadingMore, error, filters } =
    useSelector((state) => state.characters);

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Load initial characters
  useEffect(() => {
    dispatch(resetCharacters());
    dispatch(
      fetchCharacters({
        page: 1,
        limit: 12,
        type: filters.type,
        reset: true,
      })
    );
  }, [dispatch, filters.type]);

  // Handle errors
  useEffect(() => {
    if (error) {
      const errorMessage = translateError(error?.message || error);
      toast.error(errorMessage);
      dispatch(clearError());
    }
  }, [error, dispatch]); // Removed translateError from dependencies

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
    ) {
      setHasScrolledToBottom(true);
    }
  }, []);

  // Load more characters when scrolled to bottom
  useEffect(() => {
    if (
      hasScrolledToBottom &&
      !isLoading &&
      !isLoadingMore &&
      pagination.hasNextPage
    ) {
      dispatch(
        fetchCharacters({
          page: pagination.currentPage + 1,
          limit: pagination.limit,
          type: filters.type,
          reset: false,
        })
      );
      setHasScrolledToBottom(false);
    }
  }, [
    hasScrolledToBottom,
    isLoading,
    isLoadingMore,
    pagination.hasNextPage,
    pagination.currentPage,
    pagination.limit,
    filters.type,
    dispatch,
  ]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleFilterChange = (type) => {
    dispatch(setFilters({ type: type === "all" ? null : type }));
  };

  const handleCharacterDeleted = (characterId) => {
    logger.info(`Character ${characterId} deleted from list`);
  };

  return (
    <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Typography variant="h2" className="text-gray-900 mb-4">
            {t("pages.charactersPage")}
          </Typography>
          <Typography variant="lead" className="text-gray-600">
            {t("characters.pageDescription")}
          </Typography>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="h-4 w-4 text-gray-500" />
            <Typography variant="small" className="text-gray-600 w-20">
              {t("characters.filterBy")}
            </Typography>
            <Select
              value={filters.type || "all"}
              onChange={handleFilterChange}
              // className="w-40"
            >
              <Option value="all">{t("characters.allTypes")}</Option>
              <Option value="human">{t("characters.human")}</Option>
              <Option value="pet">{t("characters.pet")}</Option>
            </Select>
          </div>

          <Typography variant="small" className="text-gray-500">
            {t("characters.totalCharacters", {
              count: pagination.totalCount,
            })}
          </Typography>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Character Card */}
          <CreateCharacterCard />

          {/* Character Cards */}
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={handleCharacterDeleted}
            />
          ))}
        </div>

        {/* Loading States */}
        {isLoading && characters.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && characters.length === 0 && (
          <div className="text-center py-12">
            <Typography variant="h5" className="text-gray-600 mb-4">
              {filters.type
                ? t("characters.noCharactersOfType", {
                    type: t(`characters.${filters.type}`),
                  })
                : t("characters.noCharacters")}
            </Typography>
            <Typography variant="small" className="text-gray-500 mb-6">
              {t("characters.createFirstCharacter")}
            </Typography>
            <Button
              variant="gradient"
              onClick={() => (window.location.href = "/characters/create")}
            >
              {t("characters.createCharacter")}
            </Button>
          </div>
        )}

        {/* End of list indicator */}
        {!isLoading &&
          !isLoadingMore &&
          characters.length > 0 &&
          !pagination.hasNextPage && (
            <div className="text-center py-8">
              <Typography variant="small" className="text-gray-500">
                {t("characters.endOfList")}
              </Typography>
            </div>
          )}
      </div>
    </div>
  );
};

export default Characters;
