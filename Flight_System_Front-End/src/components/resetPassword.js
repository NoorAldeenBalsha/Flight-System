import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useLanguage } from "../context/LanguageContext"; 
import LockIcon from "@material-ui/icons/Lock";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Toast from "./toastAnimated";
import "../styles.css";

const ResetPassword = () => {
  const history = useHistory();
const { t, lang } = useLanguage(); 
  // 🌐 Detect current language from localStorage (default: EN)
  const currentLang = localStorage.getItem("lang") || "en";

  // 📝 Form state
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
  });

  // 🔔 Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 📌 Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🚀 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, resetCode, newPassword } = formData;

    // ✅ Frontend validation
    if (!email || !resetCode || !newPassword) {
      setToast({ show: true, message: t.error_fill_all, type: "error" });
      return;
    }

    try {
      // 📡 Send request to backend with language header
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

      // 🎉 Show success message from backend or fallback text
      setToast({
        show: true,
        message: res.data?.message || t.success,
        type: "success",
      });

      // ⏳ Redirect to login page after 3 seconds
      setTimeout(() => {
        history.push("/auth");
      }, 3000);
    } catch (err) {
      // ❌ Handle backend errors and show proper message
      const data = err.response?.data;
      const errorMessage =
        data?.errors?.[0]?.message || data?.message || t.error;

      setToast({ show: true, message: errorMessage, type: "error" });
    }
  };

  return (
    <div className="reset-password-container" style={{ marginTop: "5vh" }}>
      {/* 🏷 Page Title */}
      <h3 style={{ textAlign: "center", fontFamily: "Mulish" }}>
        {t("reset_password")}
      </h3>

      {/* 🔥 Global Toast */}
      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* 📋 Reset Password Form */}
      <Form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
        {/* Email Field */}
        <Form.Group>
          <Form.Label>
            {t("reset_password")} <MailOutlineIcon />
          </Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("placeholder_email", "e.g. email@domain.com")}
            required
          />
        </Form.Group>

        {/* Verification Code Field */}
        <Form.Group>
          <Form.Label>
            {t("verification_code", "Verification Code")} <LockIcon />
          </Form.Label>
          <Form.Control
            type="text"
            name="resetCode"
            value={formData.resetCode}
            onChange={handleChange}
            placeholder={t("placeholder_code", "Enter the code you received")}
            required
          />
        </Form.Group>

        {/* New Password Field */}
        <Form.Group>
          <Form.Label>
            {t("new_password", "New Password")} <LockIcon />
          </Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder={t("placeholder_new_password", "Enter new password")}
            required
          />
        </Form.Group>{/* Submit Button */}
        <Button
          type="submit"
          style={{
            width: "100%",
            borderRadius: "1rem",
            marginTop: "1rem",
            backgroundColor: "#007bff",
            border: "none",
          }}
        >
          {t("reset_password", "Reset Password")}
        </Button>
      </Form>
    </div>
  );
};

export default ResetPassword;