import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import "./i18n"; // Initialize i18n

import "./assets/index.css";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
  // </StrictMode>
);
