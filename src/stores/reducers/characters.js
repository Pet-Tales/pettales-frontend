import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CharacterService from "@/services/characterService";
import logger from "@/utils/logger";

// Initial state
const initialState = {
  characters: [],
  currentCharacter: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 12,
  },
  isLoading: false,
  isLoadingMore: false, // For infinite scroll
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isUploadingImage: false,
  uploadProgress: 0,
  error: null,
  filters: {
    type: null, // 'human', 'pet', or null for all
  },
};

// Async thunks
export const fetchCharacters = createAsyncThunk(
  "characters/fetchCharacters",
  async (
    { page = 1, limit = 12, type = null, reset = false },
    { rejectWithValue }
  ) => {
    try {
      const response = await CharacterService.getCharacters(page, limit, type);
      return {
        ...response.data.data,
        reset, // Whether to reset the characters list or append
      };
    } catch (error) {
      logger.error("Fetch characters error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to fetch characters"
      );
    }
  }
);

export const fetchCharacterById = createAsyncThunk(
  "characters/fetchCharacterById",
  async (characterId, { rejectWithValue }) => {
    try {
      const response = await CharacterService.getCharacterById(characterId);
      return response.data.data.character;
    } catch (error) {
      logger.error("Fetch character by ID error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to fetch character"
      );
    }
  }
);

export const createCharacter = createAsyncThunk(
  "characters/createCharacter",
  async (characterData, { rejectWithValue }) => {
    try {
      const response = await CharacterService.createCharacter(characterData);
      return response.data.data.character;
    } catch (error) {
      logger.error("Create character error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to create character"
      );
    }
  }
);

export const updateCharacter = createAsyncThunk(
  "characters/updateCharacter",
  async ({ characterId, updateData }, { rejectWithValue }) => {
    try {
      const response = await CharacterService.updateCharacter(
        characterId,
        updateData
      );
      return response.data.data.character;
    } catch (error) {
      logger.error("Update character error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to update character"
      );
    }
  }
);

export const deleteCharacter = createAsyncThunk(
  "characters/deleteCharacter",
  async ({ characterId, force = false }, { rejectWithValue }) => {
    try {
      await CharacterService.deleteCharacter(characterId, force);
      return characterId;
    } catch (error) {
      logger.error("Delete character error:", error);
      // Handle special case for characters used in books
      if (error?.status === 409) {
        return rejectWithValue({
          message: error?.data?.message || "Character is used in books",
          usedInBooks: error?.data?.data?.usedInBooks || [],
          requiresConfirmation: true,
        });
      }
      return rejectWithValue(
        error?.data?.message || "Failed to delete character"
      );
    }
  }
);

export const uploadCharacterImage = createAsyncThunk(
  "characters/uploadCharacterImage",
  async ({ characterId, file }, { rejectWithValue, dispatch }) => {
    try {
      // Progress callback
      const onProgress = (progress) => {
        dispatch(setUploadProgress(progress));
      };

      const response = await CharacterService.uploadCharacterImage(
        characterId,
        file,
        onProgress
      );

      return response.data.data.character;
    } catch (error) {
      logger.error("Upload character image error:", error);
      return rejectWithValue(
        error?.message || "Failed to upload character image"
      );
    }
  }
);

export const deleteCharacterImage = createAsyncThunk(
  "characters/deleteCharacterImage",
  async (characterId, { rejectWithValue }) => {
    try {
      const response = await CharacterService.deleteCharacterImage(characterId);
      return response.data.data.character;
    } catch (error) {
      logger.error("Delete character image error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to delete character image"
      );
    }
  }
);

// Characters slice
const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCharacter: (state, action) => {
      state.currentCharacter = action.payload;
    },
    clearCurrentCharacter: (state) => {
      state.currentCharacter = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { type: null };
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetCharacters: (state) => {
      state.characters = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch characters
      .addCase(fetchCharacters.pending, (state, action) => {
        const { reset } = action.meta.arg;
        if (reset) {
          state.isLoading = true;
          state.isLoadingMore = false;
        } else {
          state.isLoading = false;
          state.isLoadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const { characters, pagination, reset } = action.payload;

        if (reset) {
          state.characters = characters;
        } else {
          // Append new characters for infinite scroll
          state.characters = [...state.characters, ...characters];
        }

        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload;
      })
      // Fetch character by ID
      .addCase(fetchCharacterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCharacterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCharacter = action.payload;
        state.error = null;
      })
      .addCase(fetchCharacterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create character
      .addCase(createCharacter.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.isCreating = false;
        // Add new character to the beginning of the list
        state.characters.unshift(action.payload);
        state.pagination.totalCount += 1;
        state.error = null;
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update character
      .addCase(updateCharacter.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCharacter.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedCharacter = action.payload;

        // Update character in the list
        const index = state.characters.findIndex(
          (char) => char.id === updatedCharacter.id
        );
        if (index !== -1) {
          state.characters[index] = updatedCharacter;
        }

        // Update current character if it's the same one
        if (state.currentCharacter?.id === updatedCharacter.id) {
          state.currentCharacter = updatedCharacter;
        }

        state.error = null;
      })
      .addCase(updateCharacter.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete character
      .addCase(deleteCharacter.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCharacter.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedCharacterId = action.payload;

        // Remove character from the list
        state.characters = state.characters.filter(
          (char) => char.id !== deletedCharacterId
        );
        state.pagination.totalCount = Math.max(
          0,
          state.pagination.totalCount - 1
        );

        // Clear current character if it's the deleted one
        if (state.currentCharacter?.id === deletedCharacterId) {
          state.currentCharacter = null;
        }

        state.error = null;
      })
      .addCase(deleteCharacter.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      // Upload character image
      .addCase(uploadCharacterImage.pending, (state) => {
        state.isUploadingImage = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadCharacterImage.fulfilled, (state, action) => {
        state.isUploadingImage = false;
        state.uploadProgress = 100;
        const updatedCharacter = action.payload;

        // Update character in the list
        const index = state.characters.findIndex(
          (char) => char.id === updatedCharacter.id
        );
        if (index !== -1) {
          state.characters[index] = updatedCharacter;
        }

        // Update current character if it's the same one
        if (state.currentCharacter?.id === updatedCharacter.id) {
          state.currentCharacter = updatedCharacter;
        }

        state.error = null;
      })
      .addCase(uploadCharacterImage.rejected, (state, action) => {
        state.isUploadingImage = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      // Delete character image
      .addCase(deleteCharacterImage.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteCharacterImage.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedCharacter = action.payload;

        // Update character in the list
        const index = state.characters.findIndex(
          (char) => char.id === updatedCharacter.id
        );
        if (index !== -1) {
          state.characters[index] = updatedCharacter;
        }

        // Update current character if it's the same one
        if (state.currentCharacter?.id === updatedCharacter.id) {
          state.currentCharacter = updatedCharacter;
        }

        state.error = null;
      })
      .addCase(deleteCharacterImage.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentCharacter,
  clearCurrentCharacter,
  setFilters,
  clearFilters,
  setUploadProgress,
  resetCharacters,
} = charactersSlice.actions;

export default charactersSlice.reducer;
