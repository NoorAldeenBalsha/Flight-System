import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext"; 
import Toast from "./toastAnimated";
import LockIcon from "@material-ui/icons/Lock";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles.css";
// Forget Component
const Forget = () => {
  // State: loading, toast, input type, language
  const { t, lang } = useLanguage(); 
  const [mail, setMail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [captchaToken, setCaptchaToken] = useState("");
  //=======================================================================================================
  //Update email field state
  const handleChange = (e) => setMail(e.target.value);
  //=======================================================================================================
  //Validate input, call API and show toast messages
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mail) {setToast({show: true,message: t("error_fill_all"),type: "error",});
      return;
    }

    setIsLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          lang, // نرسل اللغة للباك
        },
      };

      if (!captchaToken) {
      setToast({ show: true, message: t("please_verify_captcha"), type: "error" });
      return;
      }
      const res = await axios.post(
        "http://localhost:5000/api/user/forgot-password",
        { email: mail ,recaptchaToken:captchaToken},
        config
      );

      setToast({
        show: true,
        message: res.data?.message || t("success_check_email"),
        type: "success",
      });

      setMail(""); // نفرغ الحقل بعد الإرسال
      setTimeout(()=>{
        window.location.href = "/reset-password";
      },1000);
    } catch (err) {
      const data = err.response?.data;
      setToast({
        show: true,
        message: data?.errors?.[0]?.message || data?.message || t("error_server"),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  //=======================================================================================================
  return (
    <>
      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* عنوان الصفحة */}
      <h4
        style={{
          marginTop: "6vh",
          fontFamily: "Mulish",
          textAlign: "center", // العنوان بالنص
        }}
      >
        {t("forgot_password_title")}
      </h4>

      <div className="forget">
        <p>
          <LockIcon style={{ fontSize: "1.2rem", color: "grey" }} />
          <span style={{ fontFamily: "Poppins", fontSize: "0.95rem" }}>
            {t("forgot_password_description")}
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              style={{
                fontFamily: "Poppins",
                fontWeight: "550",
              }}
            >
              {t("email_label")} <MailOutlineIcon />
            </label>
            <input
              type="email"
              className="form-control"
              style={{ width: "125%" }}
              placeholder={t("email_placeholder")}
              value={mail}
              onChange={handleChange}
            />
          </div>
            <ReCAPTCHA
                sitekey="6Lf4fMIrAAAAAODY0eqDV4PIp_nCcVh8lamiNGU4"
                onChange={(token) => setCaptchaToken(token)}
              />
          <button
            className="btn btn-primary"
            type="submit"
            style={{
              borderRadius: "6vh",
              textTransform: "capitalize",
              marginTop: "1rem",
              width: "15%",
            }}
            disabled={isLoading}
          >
            {isLoading ? t("loading") : t("reset_password")}
          </button>
        </form>
      </div>
    </>
  );
};
//=======================================================================================================
export default Forget;