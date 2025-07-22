import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CreditService from "@/services/creditService";
import { updateCreditsBalance } from "./auth";
import logger from "@/utils/logger";

// Async thunks
export const createPurchaseSession = createAsyncThunk(
  "credits/createPurchaseSession",
  async ({ creditAmount, context = "pricing" }, { rejectWithValue }) => {
    try {
      const response = await CreditService.createPurchaseSession(
        creditAmount,
        context
      );
      return response.data;
    } catch (error) {
      logger.error("Failed to create purchase session:", error);
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const verifyPurchase = createAsyncThunk(
  "credits/verifyPurchase",
  async (sessionId, { rejectWithValue, dispatch }) => {
    try {
      const response = await CreditService.verifyPurchase(sessionId);
      // Update auth state with new credit balance
      if (response.data.data.newBalance !== undefined) {
        dispatch(updateCreditsBalance(response.data.data.newBalance));
      }
      return response.data;
    } catch (error) {
      logger.error("Failed to verify purchase:", error);
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchCreditHistory = createAsyncThunk(
  "credits/fetchCreditHistory",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await CreditService.getCreditHistory(page, limit);
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch credit history:", error);
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchCreditBalance = createAsyncThunk(
  "credits/fetchCreditBalance",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await CreditService.getCreditBalance();
      // Update auth state with current credit balance
      if (response.data.data.balance !== undefined) {
        dispatch(updateCreditsBalance(response.data.data.balance));
      }
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch credit balance:", error);
      return rejectWithValue(error.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  balance: 0,
  transactions: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  purchaseSession: null,
  isLoading: false,
  isCreatingSession: false,
  isVerifyingPurchase: false,
  isFetchingHistory: false,
  isFetchingBalance: false,
  error: null,
};

// Credit slice
const creditSlice = createSlice({
  name: "credits",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPurchaseSession: (state) => {
      state.purchaseSession = null;
    },
    resetCredits: (state) => {
      return { ...initialState };
    },
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create purchase session
      .addCase(createPurchaseSession.pending, (state) => {
        state.isCreatingSession = true;
        state.error = null;
      })
      .addCase(createPurchaseSession.fulfilled, (state, action) => {
        state.isCreatingSession = false;
        state.purchaseSession = action.payload.data;
      })
      .addCase(createPurchaseSession.rejected, (state, action) => {
        state.isCreatingSession = false;
        state.error = action.payload;
      })

      // Verify purchase
      .addCase(verifyPurchase.pending, (state) => {
        state.isVerifyingPurchase = true;
        state.error = null;
      })
      .addCase(verifyPurchase.fulfilled, (state, action) => {
        state.isVerifyingPurchase = false;
        state.balance = action.payload.data.newBalance;
        state.purchaseSession = null;
        // Add the new transaction to the beginning of the list
        if (action.payload.data.transaction) {
          state.transactions.unshift(action.payload.data.transaction);
        }
      })
      .addCase(verifyPurchase.rejected, (state, action) => {
        state.isVerifyingPurchase = false;
        state.error = action.payload;
      })

      // Fetch credit history
      .addCase(fetchCreditHistory.pending, (state) => {
        state.isFetchingHistory = true;
        state.error = null;
      })
      .addCase(fetchCreditHistory.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.transactions = action.payload.data.transactions;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchCreditHistory.rejected, (state, action) => {
        state.isFetchingHistory = false;
        state.error = action.payload;
      })

      // Fetch credit balance
      .addCase(fetchCreditBalance.pending, (state) => {
        state.isFetchingBalance = true;
        state.error = null;
      })
      .addCase(fetchCreditBalance.fulfilled, (state, action) => {
        state.isFetchingBalance = false;
        state.balance = action.payload.data.balance;
      })
      .addCase(fetchCreditBalance.rejected, (state, action) => {
        state.isFetchingBalance = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearPurchaseSession, resetCredits, updateBalance } =
  creditSlice.actions;

export default creditSlice.reducer;
