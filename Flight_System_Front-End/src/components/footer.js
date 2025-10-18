import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext"; // إذا عندك كونتكست اللغة
import "../css/footer.css";

const Footer = () => {
  const { lang, t } = useLanguage(); // ليتفاعل مع اللغة الحالية

  return (
    <footer className={`footer ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="footer-container">
        {/* First section*/}
        <div className="footer-section about">
          <h2>{t("about_us") || "About Us"}</h2>
          <p>
            {t("footer_description") ||
              "Syrian Flight is your trusted partner for seamless travel experiences. We connect you to destinations worldwide with comfort and care."}
          </p>
        </div>

        {/* Second section*/}
        <div className="footer-section links">
          <h2>{t("quick_links") || "Quick Links"}</h2>
          <ul>
            <li><Link to="/aboutus">{t("about_us") || "About"}</Link></li>
            <li><Link to="/contact">{t("contact_Us") || "Contact"}</Link></li>
            <li><Link to="/">{t("home") || "Home"}</Link></li>
          </ul>
        </div>

        {/* ======Third section */}
        <div className="footer-section contact">
          <h2>{t("contact_us") || "Contact Us"}</h2>
          <ul>
            <li><i className="fas fa-phone"></i> +963 988 123 456</li>
            <li><i className="fas fa-envelope"></i> support@syrianflight.com</li>
            <li><i className="fas fa-map-marker-alt"></i> {t("damascus_syria") || "Damascus, Syria"}</li>
          </ul>
        </div>

        {/* Forth section */}
        <div className="footer-section social">
          <h2>{t("follow_us") || "Follow Us"}</h2>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Fifth section*/}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Syrian Flight ✈️ — {t("all_rights_reserved") || "All rights reserved."}</p>
      </div>
    </footer>
  );
};

export default Footer;