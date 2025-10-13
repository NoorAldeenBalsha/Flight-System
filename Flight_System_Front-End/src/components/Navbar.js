import React, { useContext, useState, useEffect, useRef } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom/cjs/react-router-dom"; 
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import  AuthContext  from "../context/auth/authContext";
import { useLanguage } from "../context/LanguageContext";
import "../css/navBar.css";

export default function Navbar1(props) {
  const authContext = useContext(AuthContext);
  const { lang, setLang, t } = useLanguage();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);

  if (!authContext) return null;

  const { logout, isAuthenticated, user ,loading} = authContext;

  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };

  // إغلاق البطاقة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultImage =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <Navbar
      style={{
        position: "sticky",
        top: "0",
        zIndex: "100000",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "Mulish",
        backgroundColor: "#057affff",
      }}
    > 
     
      <Navbar.Brand>
        <Link
          to="/"
          style={{ color: "#fff", fontWeight: "bold", fontSize: "1.3rem" }}
        >
          Syrian Flight <i className="fas fa-plane-departure" />
        </Link>
      </Navbar.Brand>

      <Nav style={{ alignItems: "center", position: "relative" }}>
        <div className="navLogout">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">{t("Home") || "Home"}</span>
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <div className="navLogout">
              <Link to="/order" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("Orders") || "Orders"}</span>
              </Link>
            </div>

            <div className="navLogout">
              <Link to="/addproduct" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("Add_items") || "Add Items"}</span>
              </Link>
            </div>

            <div className="navLogout">
              <Link to="/deleteitems" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("Delete_items") || "Delete Items"}</span>
              </Link>
            </div>

            <div className="navLogout">
              <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("Contact_us") || "Contact Us"}</span>
              </Link>
            </div>

            <div className="navLogout">
              <Link to="/auht" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("About Us") || "About Us"}</span>
              </Link>
            </div>

            <div className="navLogout">
              <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey" onClick={handleLogout}> {t("logout") || "Logout"} <ExitToAppIcon /></span>
              </Link>
            </div>

            
          </>
        )}

        {/* Dropdown اختيار اللغة */}
        <div
          className="select-wrapper"
          style={{ color: "white", marginLeft: "1rem" }}
        >
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ color: "white", backgroundColor: "#057affff" }}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <span className="hamburger">
          <i
            onClick={props.changeDisplay}
            className="fa fa-bars"
            aria-hidden="true"
          />
        </span>
        {isAuthenticated && (
          <div className="nav-profile-container">
              <img src={user?.picture || defaultImage} alt="Profile" className="nav-profile-img" onClick={() => setShowProfileCard(!showProfileCard)}/>
                <div className="nav-profile-container" ref={profileRef}>

              {showProfileCard && (
                <div className={`nav-profile-popup ${lang === "ar" ? "popup-ar" : "popup-en"}`}>
                  <div className="popup-header">
                    <img src={user?.picture || defaultImage} alt="Profile" className="popup-avatar"/>
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