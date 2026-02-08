import React, { useContext, useState, useEffect, useRef } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom"; 
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import  AuthContext  from "../context/auth/authContext";
import { useLanguage } from "../context/LanguageContext";
import "../css/navBar.css";
import EN from "../images/en.jpg"
import AR from "../images/ar.png"
import DE from "../images/de.png"
import ES from "../images/es.png"
import FR from "../images/fr.png"
import ZH from "../images/zh.png"
import RU from "../images/ru.png"
import TR from "../images/tr.png"
import JP from "../images/jp.png"
import ThemeSwitcher from "./themeSwitcher";
import API from "../services/api";


export default function Navbarnew() {
  const { lang, setLang, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("accessToken");
  const defaultImage ="https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const {logout}=useContext(AuthContext);
  const LANG_FLAGS = {
    en: EN,
    ar: AR,
    de:DE,
    zh:ZH,
    ru:RU,
    tr:TR,
    es:ES,
    fr:FR,
    jp:JP
  };
  //=======================================================================================================
  const authContext = useContext(AuthContext);
  if (!authContext) return null;
  const {  isAuthenticated} = authContext;
  //=======================================================================================================
  // Logout an go to Auth page
  //=======================================================================================================
  // Get current user  
  useEffect(() => {
  if (!isAuthenticated || !token) return;

  const fetchUser = async () => {
    try {
      const res = await API.get(
        "/user/current-user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      setFormData({
        ...res.data,
        userId: res.data._id,
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  };

  fetchUser();
}, [isAuthenticated, token]);
  //=======================================================================================================
  // For close & open profile card  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  //=======================================================================================================
  //This one for language flags
  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  //=======================================================================================================
  return (
    <Navbar className="navbarcolor" 
      style={{position:"sticky",top:"0",zIndex:"100000",display:"flex",justifyContent:"space-between",fontFamily:"Mulish",}}> 
      {/* Website title*/}
      <Navbar.Brand>
        <Link to="/" style={{ color: "#fff", fontWeight: "bold", fontSize: "1.3rem"  }}>
           { t.syrian_Flight }
        </Link>
      </Navbar.Brand>

      <Nav style={{ alignItems: "center", position: "relative" }}>

        {/* Sign in */}
        {!isAuthenticated && (
          <div className="navLogout">
            <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
              <span className="bg_grey">{t.sign_in}</span>
            </Link>
          </div>
        )}

        {/* Home */}
        <div className="navLogout">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">{t.home}</span>
          </Link>
        </div>

        {/* Kinan */}
        <div className="navLogout">
          <Link to="/unity" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">Kinan</span>
          </Link>
        </div>

        {/* Logged in buttons */}
        {isAuthenticated && (
          <>
            {/* Flights */}
            <div className="navLogout">
              <Link to="/flights" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t.flights}</span>
              </Link>
            </div>

            {/* Contact */}
            <div className="navLogout">
              <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t.contact_Us}</span>
              </Link>
            </div>

            {/* About */}
            <div className="navLogout">
              <Link to="/about-us" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t.about_us}</span>
              </Link>
            </div>

            {/* Dashboard ONLY for Admin */}
            {user?.role === "admin" && (
              <div className="navLogout">
                <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
                  <span className="bg_grey">{t.data_analysis}</span>
                </Link>
              </div>
            )}

            {/* Logout */}
            <div className="navLogout">
              <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
              <button 
                className="bg_grey" 
                onClick={async () => {await logout();window.location.href="/auth"}}>
                  {t.logout} <ExitToAppIcon /></button>
              </Link>
            </div>
          </>
        )}

        {/* Language Dropdown */}
        <div className={`lang-dropdown-wrapper ${lang === "ar" ? "rtl-lang" : "ltr-lang"}`} ref={langRef}>
          <div className="lang-selected" onClick={() => setShowLangDropdown(!showLangDropdown)}>
            <img
              src={
              lang === "en" ? LANG_FLAGS.en :
              lang === "ar" ? LANG_FLAGS.ar :
              lang === "zh" ? LANG_FLAGS.zh :
              lang === "tr" ? LANG_FLAGS.tr :
              lang === "ru" ? LANG_FLAGS.ru :
              lang === "es" ? LANG_FLAGS.es :
              lang === "fr" ? LANG_FLAGS.fr :
              lang === "de" ? LANG_FLAGS.de :
              lang === "jp" ? LANG_FLAGS.jp :
              LANG_FLAGS.en}
              alt="flag"
              className="lang-flag"
            />
          </div>

          {showLangDropdown && (
            <div className="lang-dropdown">
               {/* Language En */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("en"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.en} alt="en" className="lang-flag" />
                <span className="lang-label">{t.en}</span>
              </div>
              {/* Language Es */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("es"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.es} alt="es" className="lang-flag" />
                <span className="lang-label">{t.es}</span>
              </div>
              {/* Language Fn */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("fr"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.fr} alt="fr" className="lang-flag" />
                <span className="lang-label">{t.fr}</span>
              </div>
              {/* Language DE */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("de"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.de} alt="de" className="lang-flag" />
                <span className="lang-label">{t.de}</span>
              </div>
              {/* Language Tr */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("tr"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.tr} alt="tr" className="lang-flag" />
                <span className="lang-label">{t.tr}</span>
              </div>
              {/* Language Ru */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("ru"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.ru} alt="ru" className="lang-flag" />
                <span className="lang-label">{t.ru}</span>
              </div>
              {/* Language Zh */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("zh"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.zh} alt="zh" className="lang-flag" />
                <span className="lang-label">{t.zh}</span>
              </div>
              {/* Language JP */}
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("jp"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.jp} alt="jp" className="lang-flag" />
                <span className="lang-label">{t.jp}</span>
              </div>
              {/* Language Ar */}
              <div 
                className={`lang-option ${lang === "ar" ? "active-lang" : ""}`} 
                onClick={() => { setLang("ar"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.ar} alt="ar" className="lang-flag" />
                <span className="lang-label">{t.ar}</span>
              </div>

            </div>
          )}
        </div>


          <ThemeSwitcher></ThemeSwitcher>

        {/* Profile card */}
        {isAuthenticated && (
          <div className="nav-profile-container">

            <img
              src={user?.picture || defaultImage}
              alt="Profile"
              className="nav-profile-img"
              onClick={() => setShowProfileCard(!showProfileCard)}
            />

            <div className="nav-profile-container" ref={profileRef}>
              {showProfileCard && (
                <div className={`nav-profile-popup ${lang === "ar" ? "popup-ar" : "popup-en"}`}>
                  <div className="popup-header">

                    <img
                      src={user?.picture || defaultImage}
                      alt="Profile"
                      className="popup-avatar"
                    />

                    <div className="popup-info">
                      <h4>{user?.fullName || "User Name"}</h4>
                      <p>{user?.email || "user@example.com"}</p>
                    </div>

                  </div>

                  <div className="popup-actions">
                    <button
                      onClick={() => (window.location.href = "/profile")}
                      className="popup-btn"
                    >
                      {lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </Nav>
       
    </Navbar>
  );
}