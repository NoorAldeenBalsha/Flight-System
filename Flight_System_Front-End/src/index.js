import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AuthState from "./context/auth/authState";
import CartState from "./context/cart/cartState";
import ProductState from "./context/products/productState";
import LoadingState from "./context/loading/loadingState";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalToastProvider from "./components/GlobalToast";
import { LanguageProvider } from "./context/LanguageContext";
import process from "process";
import { BrowserRouter as Router} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
window.process=process;
ReactDOM.render(
  
  <LanguageProvider>
    <React.StrictMode>
      <GlobalToastProvider>
        <ErrorBoundary>
          <AuthState>
            <LoadingState>
              <ProductState>
                <CartState>
                  <Router>
                    <GoogleOAuthProvider clientId="136188509800-5cs4tpi1pol2jfgna16g0rj7cb759abq.apps.googleusercontent.com">
                    <App />
                    </GoogleOAuthProvider>
                  </Router>
                </CartState>
              </ProductState>
            </LoadingState>
          </AuthState>
        </ErrorBoundary>
      </GlobalToastProvider>
    </React.StrictMode>
  </LanguageProvider>,
  document.getElementById("root")
);