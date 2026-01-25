import React, { useEffect } from "react";
import "../css/contactUs.css";
import { useLanguage } from "../context/LanguageContext";

const ContactUs = () => {
  const { lang, t } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div className={`contact-container-contact ${lang === "ar" ? "rtl" : ""}`}>
      <div className="contact-box-contact">
        {/* ==== Left Side: Form ==== */}
        <div className="contact-form-contact">
          <h2>{t.contact_title}</h2>
          <form>
            <div className="input-group-contact">
              <i className="fas fa-user"></i>
              <input type="text" placeholder={t.contact_name} required />
            </div>
            <div className="input-group-contact">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder={t.contact_email} required />
            </div>
            <div className="input-group-contact textarea">
              <i className="fas fa-comment"></i>
              <textarea placeholder={t.contact_message} required></textarea>
            </div>
            <button type="submit" className="send-btn-contact">
              {t.contact_send}
            </button>
          </form>
        </div>

        {/* ==== Right Side: Illustration ==== */}
        <div className="contact-illustration-contact">
          <img
            src="https://img.freepik.com/free-vector/contact-us-concept-illustration_114360-2299.jpg"
            alt="Contact Illustration-contact"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactUs;