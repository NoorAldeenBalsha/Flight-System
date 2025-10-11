import React, { useContext } from "react";
import AuthContext from "../context/auth/authContext";
import { Route, Redirect } from "react-router-dom";
import { useLocation, useHistory } from "react-router-dom";
import "../styles.css";

const RgistrationSuccess = ({ component: Component, ...rest }) => {
  const { isAuthenticated, verified, loading } = useContext(AuthContext);

 const location = useLocation();
  const history = useHistory();

  // الرسالة القادمة من التسجيل
  const message =
    location.state?.message ||
    "Account created successfully! Please check your email to verify your account.";

  const goToLogin = () => {
    history.push("/auth"); // الرجوع لتسجيل الدخول
  };

  return (
    <div className="registration-success-container">
      <div className="success-card">
        <h2>🎉 Success!</h2>
        <p>{message}</p>
        <button className="btn" onClick={goToLogin}>
          Go to Login
        </button>
      </div>
    </div>
  );
};
export default RgistrationSuccess;