import React from "react";
import {  useNavigate } from "react-router-dom";
import "../../css/rgistrationSuccess.css"
import { useLanguage } from "../../context/LanguageContext";

const RgistrationSuccess = ({ component: Component, ...rest }) => {
  const { t } = useLanguage(); 
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/auth"); 
  };

  return (
    <div className="registration-success-container">
      <div className="success-card">
        <h2> {t.RgistrationSuccess_success}</h2>
        <p>{t.RgistrationSuccess_message}</p>
        <button className="btn" onClick={goToLogin}>
         {t.RgistrationSuccess_login}
        </button>
      </div>
    </div>
  );
};
export default RgistrationSuccess;