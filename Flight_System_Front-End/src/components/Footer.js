import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../css/footer.css";

const Footer = () => {
  const { lang, t } = useLanguage(); 

  return (
    <footer className={`footer ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="footer-container">
        {/* First section*/}
        <div className="footer-section about">
          <h2>{t.about_us }</h2>
          <p>
            {t.footer_description}
          </p>
        </div>

        {/* Second section*/}
        <div className="footer-section links">
          <h2>{t.quick_links }</h2>
          <ul>
            <li><Link to="/about-us">{t.about_us}</Link></li>
            <li><Link to="/contact">{t.contact_Us }</Link></li>
            <li><Link to="/">{t.home }</Link></li>
          </ul>
        </div>

        {/* ======Third section */}
        <div className="footer-section contact">
          <h2>{t.contact_us }</h2>
          <ul>
            <li><i className="fas fa-phone"></i> +963 988 123 456</li>
            <li><i className="fas fa-envelope"></i> support@syrianflight.com</li>
            <li><i className="fas fa-map-marker-alt"></i> {t.damascus_syria}</li>
          </ul>
        </div>

        {/* Forth section */}
        <div className="footer-section social">
          <h2>{t.follow_us}</h2>
          <div className="social-icons">
            <a href="https://www.facebook.com"><i className="fab fa-facebook"></i></a>
            <a href="https://www.x.com"><i className="fab fa-twitter"></i></a>
            <a href="https://www.instagram.com"><i className="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Fifth section*/}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Syrian Flight  — {t.all_rights_reserved}</p>
      </div>
    </footer>
  );
};

export default Footer;
