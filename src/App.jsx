import { useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Routes from "./routes";
import { store } from "@/stores/store";
import {
  getCurrentUser,
  markAuthAttempted,
  setUser,
} from "@/stores/reducers/auth";
import LanguageUtils from "@/utils/languageUtils";
import logger from "./utils/logger";

function AppContent() {
  const dispatch = useDispatch();
  const pages = useRoutes(Routes);
  const { hasAttemptedAuth, isAuthenticated, isValidatingSession, user } =
    useSelector((state) => state.auth);

  // Initialize language system on app startup
  useEffect(() => {
    LanguageUtils.initializeLanguageSystem();
  }, []);

  useEffect(() => {
    // Only attempt to validate session if we haven't tried yet and not already validating
    if (!hasAttemptedAuth && !isValidatingSession) {
      // If we have localStorage data, validate the session with server
      if (isAuthenticated) {
        logger.info("App: Validating session with server");
        dispatch(getCurrentUser());
      } else {
        // No localStorage data, just mark as attempted without API call
        logger.info("App: No localStorage data, marking auth as attempted");
        dispatch(markAuthAttempted());
      }
    }
  }, [dispatch, hasAttemptedAuth, isAuthenticated, isValidatingSession]);

  // Sync language preferences when user data is available
  useEffect(() => {
    if (user) {
      LanguageUtils.syncLanguagePreferences(
        user,
        (updatedUser) => dispatch(setUser(updatedUser)),
        isAuthenticated
      );
    }
  }, [user, dispatch, isAuthenticated]);

  return (
    <>
      {pages}
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
