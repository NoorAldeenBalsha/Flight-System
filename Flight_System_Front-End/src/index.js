import React from "react";
import {createRoot }from "react-dom/client"
import AuthState from "./context/auth/authState";
import LoadingState from "./context/loading/loadingState";
import GlobalToastProvider from "./components/GlobalToast";
import { LanguageProvider } from "./context/LanguageContext";
import process from "process";
import { BrowserRouter} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./context/auth/authProvider";
import "./styles/theme.css"
import ThemeProvider from "./context/theme/themeContext";
import "./styles/theme.css"
import ScrollToTop from "./components/scrollToTop";
import App from "./app";

window.process=process;

const container=document.getElementById("root")
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <GlobalToastProvider>
        <AuthState>
          <LoadingState>
            <ThemeProvider>
              <BrowserRouter future={{ v7_relativeSplatPath:true,v7_startTransition:true}}>
                <GoogleOAuthProvider clientId="136188509800-5cs4tpi1pol2jfgna16g0rj7cb759abq.apps.googleusercontent.com">
                  <AuthProvider>
                    <ScrollToTop/>
                    <App />
                  </AuthProvider>
                </GoogleOAuthProvider>
              </BrowserRouter>
            </ThemeProvider>
          </LoadingState>
        </AuthState>
      </GlobalToastProvider>
    </LanguageProvider>
  </React.StrictMode>,
);