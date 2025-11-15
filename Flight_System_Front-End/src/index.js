import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AuthState from "./context/auth/authState";
import LoadingState from "./context/loading/loadingState";
import GlobalToastProvider from "./components/GlobalToast";
import { LanguageProvider } from "./context/LanguageContext";
import process from "process";
import { BrowserRouter as Router} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./context/auth/authProvider";
window.process=process;
ReactDOM.render(
  
  <LanguageProvider>
    <React.StrictMode>
      <GlobalToastProvider>
          <AuthState>
            <LoadingState>
                  <Router>
                    <GoogleOAuthProvider clientId="136188509800-5cs4tpi1pol2jfgna16g0rj7cb759abq.apps.googleusercontent.com">
                    <AuthProvider>
                    <App />
                    </AuthProvider>
                    </GoogleOAuthProvider>
                  </Router>
            </LoadingState>
          </AuthState>
      </GlobalToastProvider>
    </React.StrictMode>
  </LanguageProvider>,
  document.getElementById("root")
);