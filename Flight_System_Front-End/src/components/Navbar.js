import React, { useContext, useState, useEffect, useRef } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom"; 
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import  AuthContext  from "../context/auth/authContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import "../css/navBar.css";

export default function Navbar1(props) {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("accessToken");
  const defaultImage ="https://cdn-icons-png.flaticon.com/512/847/847969.png";
  //=======================================================================================================
  const authContext = useContext(AuthContext);
  if (!authContext) return null;
  const { logout, isAuthenticated ,loading} = authContext;
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


  return (
    <Navbar
    className="navbarcolor"
      style={{
        position: "sticky",
        top: "0",
        zIndex: "100000",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "Mulish",
      }}
    > 
      {/* Website title*/}
      <Navbar.Brand>
        <Link to="/" style={{ color: "#fff", fontWeight: "bold", fontSize: "1.3rem"  }}>
           <span style={{ color: "#00b4d8", margin:"0.5rem"}} 
           className="fas fa-plane-departure"></span>
           { t("syrian_Flight") }
        </Link>
      </Navbar.Brand>

      <Nav style={{ alignItems: "center", position: "relative" }}> 
        {/* Button sign in*/}
        {!isAuthenticated && (
          <div className="navLogout">
          <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">{t("sign_in") || "Sign in"}</span>
          </Link>
        </div>
        )}

        {/* Button Home*/}
        <div className="navLogout">
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            <span className="bg_grey">{t("home") || "Home"}</span>
          </Link>
        </div>

        {/* Buttons if you login*/}
        {isAuthenticated && (
          <>
            {/* Button flight*/}
            <div className="navLogout">
              <Link to="/flights" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("flights") || "Flights"}</span>
              </Link>
            </div>

            {/* Button addproduct*/}
            <div className="navLogout">
              <Link to="/addproduct" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("Add_items") || "Add Items"}</span>
              </Link>
            </div>

            {/* Button deleteitems*/}
            <div className="navLogout">
              <Link to="/deleteitems" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("delete_items") || "Delete Items"}</span>
              </Link>
            </div>

            {/* Button contact*/}
            <div className="navLogout">
              <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("contact_Us") || "Contact Us"}</span>
              </Link>
            </div>

            {/* Button about-us*/}
            <div className="navLogout">
              <Link to="/about-us" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey">{t("about_us") || "About Us"}</span>
              </Link>
            </div>

            {/* Button Logout*/}
            <div className="navLogout">
              <Link to="/auth" style={{ color: "white", textDecoration: "none" }}>
                <span className="bg_grey" onClick={handleLogout}> {t("logout") || "Logout"} <ExitToAppIcon /></span>
              </Link>
            </div>

          </>
        )}

        {/* Choose lang*/}
        <div className="select-wrapper"
        style={{ color: "white" }}>
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ color: "white"}}
          >
            <option  style={{ color: "white",background:"#005b96" }} value="en">English</option>
            <option  style={{ color: "white",background:"#005b96" }} value="ar">العربية</option>
          </select>
        </div>

        {/* Small profile card in Navbar*/}
        {isAuthenticated && (
          <div className="nav-profile-container">
            {/* Profile Picture*/}
              <img src={user?.picture || defaultImage} alt="Profile"className="nav-profile-img" onClick={() => setShowProfileCard(!showProfileCard)}/>
              
                <div className="nav-profile-container" ref={profileRef}>
                  {showProfileCard && (
                    <div className={`nav-profile-popup ${lang === "ar" ? "popup-ar" : "popup-en"}`}>
                      <div className="popup-header">
                        {/* Profile Picture*/}
                        <img src={user.picture || defaultImage} alt="Profile" className="popup-avatar"/>
                        <div className="popup-info">
                          {/* Profile Name*/}
                          <h4>{user?.fullName || "User Name"}</h4>
                          {/* Profile Email*/}
                          <p>{user?.email || "user@example.com"}</p>
                        </div>
                      </div>

                      <div className="popup-actions">
                        {/*Edit Button*/}
                        <button onClick={() => (window.location.href = "/profile")}className="popup-btn">
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