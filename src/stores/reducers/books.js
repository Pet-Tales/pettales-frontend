import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BookService from "@/services/bookService";
import logger from "@/utils/logger";

// Initial state
const initialState = {
  books: [],
  currentBook: null,
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
  isTogglingPublic: false,
  isRetrying: false,
  error: null,
  filters: {
    status: null, // 'pending', 'generating', 'completed', 'failed', or null for all
  },
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (
    { page = 1, limit = 12, status = null, reset = false },
    { rejectWithValue }
  ) => {
    try {
      const response = await BookService.getUserBooks(page, limit, status);
      return {
        ...response.data.data,
        reset, // Whether to reset the books list or append
      };
    } catch (error) {
      logger.error("Fetch books error:", error);
      return rejectWithValue(error?.data?.message || "Failed to fetch books");
    }
  }
);

export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await BookService.getBookById(bookId);
      return response.data.data.book;
    } catch (error) {
      logger.error("Fetch book by ID error:", error);
      return rejectWithValue(error?.data?.message || "Failed to fetch book");
    }
  }
);

export const createBook = createAsyncThunk(
  "books/createBook",
  async (bookData, { rejectWithValue }) => {
    try {
      const response = await BookService.createBook(bookData);
      return response.data.data.book;
    } catch (error) {
      logger.error("Create book error:", error);
      return rejectWithValue(error?.data?.message || "Failed to create book");
    }
  }
);

export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ bookId, updateData }, { rejectWithValue }) => {
    try {
      const response = await BookService.updateBook(bookId, updateData);
      return response.data.data.book;
    } catch (error) {
      logger.error("Update book error:", error);
      return rejectWithValue(error?.data?.message || "Failed to update book");
    }
  }
);

export const toggleBookPublic = createAsyncThunk(
  "books/toggleBookPublic",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await BookService.toggleBookPublic(bookId);
      return response.data.data.book;
    } catch (error) {
      logger.error("Toggle book public error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to toggle book status"
      );
    }
  }
);

export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (bookId, { rejectWithValue }) => {
    try {
      await BookService.deleteBook(bookId);
      return bookId;
    } catch (error) {
      logger.error("Delete book error:", error);
      return rejectWithValue(error?.data?.message || "Failed to delete book");
    }
  }
);

export const retryBookGeneration = createAsyncThunk(
  "books/retryBookGeneration",
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await BookService.retryBookGeneration(bookId);
      return response.data.data.book;
    } catch (error) {
      logger.error("Retry book generation error:", error);
      return rejectWithValue(
        error?.data?.message || "Failed to retry book generation"
      );
    }
  }
);

// Create slice
const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Reset books list
    resetBooks: (state) => {
      state.books = [];
      state.pagination = initialState.pagination;
    },
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear current book
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
    // Update book in list (for real-time updates)
    updateBookInList: (state, action) => {
      const updatedBook = action.payload;
      const index = state.books.findIndex((book) => book.id === updatedBook.id);
      if (index !== -1) {
        state.books[index] = { ...state.books[index], ...updatedBook };
      }
    },
    // Set PDF regeneration flag for current book
    setPdfNeedsRegeneration: (state, action) => {
      const { bookId, needsRegeneration } = action.payload;
      if (state.currentBook && state.currentBook.id === bookId) {
        state.currentBook.pdfNeedsRegeneration = needsRegeneration;
      }
      // Also update in books list if present
      const index = state.books.findIndex((book) => book.id === bookId);
      if (index !== -1) {
        state.books[index].pdfNeedsRegeneration = needsRegeneration;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state, action) => {
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
      .addCase(fetchBooks.fulfilled, (state, action) => {
        const { books, pagination, reset } = action.payload;

        if (reset) {
          state.books = books;
        } else {
          // Append new books for infinite scroll
          state.books = [...state.books, ...books];
        }

        state.pagination = pagination;
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload;
      })

      // Fetch book by ID
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.currentBook = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create book
      .addCase(createBook.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        // Add new book to the beginning of the list
        state.books.unshift(action.payload);
        state.pagination.totalCount += 1;
        state.isCreating = false;
        state.error = null;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update book
      .addCase(updateBook.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const updatedBook = action.payload;

        // Update in books list
        const index = state.books.findIndex(
          (book) => book.id === updatedBook.id
        );
        if (index !== -1) {
          state.books[index] = updatedBook;
        }

        // Update current book if it's the same
        if (state.currentBook && state.currentBook.id === updatedBook.id) {
          state.currentBook = { ...state.currentBook, ...updatedBook };
        }

        state.isUpdating = false;
        state.error = null;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Toggle book public
      .addCase(toggleBookPublic.pending, (state) => {
        state.isTogglingPublic = true;
        state.error = null;
      })
      .addCase(toggleBookPublic.fulfilled, (state, action) => {
        const updatedBook = action.payload;

        // Update in books list
        const index = state.books.findIndex(
          (book) => book.id === updatedBook.id
        );
        if (index !== -1) {
          state.books[index] = updatedBook;
        }

        // Update current book if it's the same
        if (state.currentBook && state.currentBook.id === updatedBook.id) {
          state.currentBook = { ...state.currentBook, ...updatedBook };
        }

        state.isTogglingPublic = false;
        state.error = null;
      })
      .addCase(toggleBookPublic.rejected, (state, action) => {
        state.isTogglingPublic = false;
        state.error = action.payload;
      })

      // Delete book
      .addCase(deleteBook.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        const deletedBookId = action.payload;

        // Remove from books list
        state.books = state.books.filter((book) => book.id !== deletedBookId);
        state.pagination.totalCount = Math.max(
          0,
          state.pagination.totalCount - 1
        );

        // Clear current book if it's the deleted one
        if (state.currentBook && state.currentBook.id === deletedBookId) {
          state.currentBook = null;
        }

        state.isDeleting = false;
        state.error = null;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // Retry book generation
      .addCase(retryBookGeneration.pending, (state) => {
        state.isRetrying = true;
        state.error = null;
      })
      .addCase(retryBookGeneration.fulfilled, (state, action) => {
        const updatedBook = action.payload;

        // Update in books list
        const index = state.books.findIndex(
          (book) => book.id === updatedBook.id
        );
        if (index !== -1) {
          state.books[index] = updatedBook;
        }

        // Update current book if it's the same
        if (state.currentBook && state.currentBook.id === updatedBook.id) {
          state.currentBook = { ...state.currentBook, ...updatedBook };
        }

        state.isRetrying = false;
        state.error = null;
      })
      .addCase(retryBookGeneration.rejected, (state, action) => {
        state.isRetrying = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  resetBooks,
  setFilters,
  clearCurrentBook,
  updateBookInList,
  setPdfNeedsRegeneration,
} = booksSlice.actions;

// Export reducer
export default booksSlice.reducer;
