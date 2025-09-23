import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import http from "@/utils/http";
import logger from "@/utils/logger";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Request interceptor to log outgoing requests
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to handle session expiration
let store; // Will be set by the store
export const setAxiosStore = (storeInstance) => {
  store = storeInstance;
};

// Helper to clear auth on 401 when user was previously authenticated
const handleUnauthorizedIfAuthenticated = (error) => {
  try {
    if (error?.response?.status === 401 && store) {
      const state = store.getState();
      if (state?.auth?.isAuthenticated) {
        logger.info(
          "401 received - clearing auth state (likely expired session)"
        );
        setStoredUser(null);
        store.dispatch(clearAuth());
      }
    }
  } catch (e) {
    // no-op
  }
  return Promise.reject(error);
};

axios.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorizedIfAuthenticated(error)
);

// Also attach the same interceptor to the shared axios instance used for API calls
http.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorizedIfAuthenticated(error)
);

// Helper functions for localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    logger.error("Error parsing stored user:", error);
    localStorage.removeItem("auth_user");
    return null;
  }
};

const getStoredAuthState = () => {
  try {
    const storedAuth = localStorage.getItem("auth_isAuthenticated");
    return storedAuth === "true";
  } catch (error) {
    logger.error("Error parsing stored auth state:", error);
    return false;
  }
};

const setStoredUser = (user) => {
  try {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_isAuthenticated", "true");
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_isAuthenticated");
    }
  } catch (error) {
    logger.error("Error storing user data:", error);
  }
};

// Initial state with localStorage data
const storedUser = getStoredUser();
const storedAuthState = getStoredAuthState();

const initialState = {
  user: storedUser,
  isAuthenticated: storedAuthState,
  isLoading: false,
  error: null,
  emailVerificationSent: false,
  hasAttemptedAuth: false, // Track if we've tried to get current user
  isValidatingSession: false, // Track if we're currently validating session
};

// Async thunks
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // Import i18n to get current language
      const i18n = (await import("@/i18n")).default;

      // Include current language in registration data
      const registrationData = {
        ...userData,
        preferred_language: i18n.language || "en",
      };

      const response = await http.post("/api/auth/register", registrationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await http.post("/api/auth/login", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await http.post("/api/auth/logout");
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get("/api/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get user"
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await http.get(`/api/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Email verification failed"
      );
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  "auth/resendEmailVerification",
  async (email, { rejectWithValue }) => {
    try {
      const response = await http.post("/api/auth/resend-verification", {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resend verification email"
      );
    }
  }
);

// Forgot password async thunk
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await http.post("/api/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      logger.error("Forgot password error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// Reset password async thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await http.post("/api/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      logger.error("Reset password error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// Request password change async thunk (sends reset email)
export const requestPasswordChange = createAsyncThunk(
  "auth/requestPasswordChange",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.post("/api/user/request-password-change");
      return response.data;
    } catch (error) {
      logger.error("Request password change error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send password reset email"
      );
    }
  }
);

// Update profile async thunk
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await http.put("/api/user/profile", profileData);
      return response.data;
    } catch (error) {
      logger.error("Update profile error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Verify email change async thunk
export const verifyEmailChange = createAsyncThunk(
  "auth/verifyEmailChange",
  async (token, { rejectWithValue }) => {
    try {
      const response = await http.get(
        `/api/user/verify-email-change?token=${token}`
      );
      return response.data;
    } catch (error) {
      logger.error("Verify email change error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Email change verification failed"
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEmailVerificationSent: (state) => {
      state.emailVerificationSent = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Store in localStorage
      setStoredUser(action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Mark that we've already handled auth once to avoid re-validation loops
      state.hasAttemptedAuth = true;
      state.isValidatingSession = false;
      // Clear localStorage
      setStoredUser(null);
    },
    markAuthAttempted: (state) => {
      state.hasAttemptedAuth = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerificationSent = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
        // Store in localStorage
        setStoredUser(action.payload.data.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        // Clear localStorage
        setStoredUser(null);
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.hasAttemptedAuth = true;
        state.isValidatingSession = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
        state.hasAttemptedAuth = true;
        state.isValidatingSession = false;
        // Store in localStorage
        setStoredUser(action.payload.data.user);
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.error = null; // Don't show error for failed auth check
        state.hasAttemptedAuth = true;
        state.isValidatingSession = false;
        // Don't clear auth state here - let the axios interceptor handle 401s
        // For other errors (network issues), keep the user logged in
      })
      // Resend email verification
      .addCase(resendEmailVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.emailVerificationSent = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify email
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // If verification response includes user data, update the state
        if (action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user;
          state.isAuthenticated = true;
          // Store in localStorage
          setStoredUser(action.payload.data.user);
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Request password change
      .addCase(requestPasswordChange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordChange.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordChange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.error = null;
        // Store updated user in localStorage
        setStoredUser(action.payload.data.user);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify email change
      .addCase(verifyEmailChange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailChange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.error = null;
        // Store updated user in localStorage
        setStoredUser(action.payload.data.user);
      })
      .addCase(verifyEmailChange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearEmailVerificationSent,
  setUser,
  clearAuth,
  markAuthAttempted,
} = authSlice.actions;
export default authSlice.reducer;
