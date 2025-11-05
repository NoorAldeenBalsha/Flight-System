import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useLanguage } from "../../context/LanguageContext"; 
import LockIcon from "@material-ui/icons/Lock";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../toastAnimated";
import "../../css/resetPassword.css";
import resetPasswordImage from "../../images/resetPasswordImage.jpg"

const ResetPassword = () => {
  const history = useNavigate();
  const { t, lang } = useLanguage(); 
  //  Detect current language from localStorage (default: EN)
  const currentLang = localStorage.getItem("lang") || "en";

  //  Form state
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
  });

  //  Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  //  Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //  Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, resetCode, newPassword } = formData;

    //  Frontend validation
    if (!email || !resetCode || !newPassword) {
      setToast({ show: true, message: t.error_fill_all, type: "error" });
      return;
    }

    try {
      //  Send request to backend with language header
      const res = await axios.post(
        "http://localhost:5000/api/user/reset-password",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            lang, // 🔑 Pass language to backend
          },
        }
      );

      //  Show success message from backend or fallback text
      setToast({
        show: true,
        message: res.data?.message || t.success,
        type: "success",
      });

      //  Redirect to login page after 3 seconds
      setTimeout(() => {
        history.push("/auth");
      },5000);
    } catch (err) {
      //  Handle backend errors and show proper message
      const data = err.response?.data;
      const errorMessage =
        data?.errors?.[0]?.message || data?.message || t.error;

      setToast({ show: true, message: errorMessage, type: "error" });
    }
  };

  return (
    
    <div className={`reset-wrapper ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="reset-container">
        <div className="reset-illustration">
          <div className="circle-bg"></div>
          <div className="key-icon">
            <img src={resetPasswordImage} alt="Reset illustration" />
          </div>
        </div>

        <div className="reset-form-box">
          <h2>{t("reset_title")}</h2>
           {/*  Global Toast */}
                {toast.show && (
                  <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                  />
                )}
          <p className="subtitle">{t("reset_subtitle")}</p>

          <form onSubmit={handleSubmit}>
            <label>{t("reset_emailLabel")}</label>
            <input
              type="email"
              name="email"
              placeholder={t("reset_emailPlaceholder")}
              onChange={handleChange}
              required
            />

            <label>{t("reset_codeLabel")}</label>
            <input
              type="text"
              name="resetCode"
              placeholder={t("reset_codePlaceholder")}
              onChange={handleChange}
              required
            />

            <label>{t("reset_newPasswordLabel")}</label>
            <input
              type="password"
              name="newPassword"
              placeholder={t("reset_newPasswordPlaceholder")}
              onChange={handleChange}
              required
            />
            <button type="submit" className="submit-btn">
              {t("reset_submitButton")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;