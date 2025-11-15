import React, { useContext, useState, useEffect, useRef } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom"; 
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import  AuthContext  from "../context/auth/authContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import "../css/navBar.css";
import EN from "../images/en.jpg"
import AR from "../images/ar.png"

export default function Navbar1(props) {
  const { lang, setLang, t } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("accessToken");
  const defaultImage ="https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const LANG_FLAGS = {en: EN,ar: AR};
  //=======================================================================================================
  const authContext = useContext(AuthContext);
  if (!authContext) return null;
  const { logout, isAuthenticated} = authContext;
  //=======================================================================================================
  // Logout an go to Auth page
  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };
  //=======================================================================================================
  // Get current user  
  useEffect(() => {
    const fetchUser = async () => {
      try {
     
        const res = await axios.get(
          "http://localhost:5000/api/user/current-user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setFormData({
          ...res.data,
          userId: res.data._id, 
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);
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
           <span style={{ color: "#ffffffff", margin:"0.5rem"}} 
           className="fas fa-plane-departure"></span>
           { t("syrian_Flight") }
        </Link>
      </Navbar.Brand>

      <Nav style={{ alignItems: "center", position: "relative" }}>

        {/* Sign in */}
        {!isAuthenticated && (
          <div className="navLogout">
            <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
              <span className="bg_grey">{t("sign_in") || "Sign in"}</span>
            </Link>
          </div>
        )}

        {/* Home */}
        <div className="navLogout">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">{t("home") || "Home"}</span>
          </Link>
        </div>

        {/* Logged in buttons */}
        {isAuthenticated && (
          <>
            {/* Flights */}
            <div className="navLogout">
              <Link to="/flights" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("flights") || "Flights"}</span>
              </Link>
            </div>

            {/* Contact */}
            <div className="navLogout">
              <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("contact_Us") || "Contact Us"}</span>
              </Link>
            </div>

            {/* About */}
            <div className="navLogout">
              <Link to="/about-us" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("about_us") || "About Us"}</span>
              </Link>
            </div>

            {/* Dashboard ONLY for Admin */}
            {user?.role === "admin" && (
              <div className="navLogout">
                <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
                  <span className="bg_grey">{t("data_analysis") || "Data analysis"}</span>
                </Link>
              </div>
            )}

            {/* Logout */}
            <div className="navLogout">
              <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey" onClick={handleLogout}>
                  {t("logout") || "Logout"} <ExitToAppIcon />
                </span>
              </Link>
            </div>
          </>
        )}

        {/* Language Dropdown */}
        <div className={`lang-dropdown-wrapper ${lang === "ar" ? "rtl-lang" : "ltr-lang"}`} ref={langRef}>
          <div className="lang-selected" onClick={() => setShowLangDropdown(!showLangDropdown)}>
            <img
              src={lang === "en" ? LANG_FLAGS.en : LANG_FLAGS.ar}
              alt="flag"
              className="lang-flag"
            />
          </div>

          {showLangDropdown && (
            <div className="lang-dropdown">
              <div 
                className={`lang-option ${lang === "en" ? "active-lang" : ""}`} 
                onClick={() => { setLang("en"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.en} alt="en" className="lang-flag" />
                <span className="lang-label">English</span>
              </div>

              <div 
                className={`lang-option ${lang === "ar" ? "active-lang" : ""}`} 
                onClick={() => { setLang("ar"); setShowLangDropdown(false); }}
              >
                <img src={LANG_FLAGS.ar} alt="ar" className="lang-flag" />
                <span className="lang-label">العربية</span>
              </div>
            </div>
          )}
        </div>

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