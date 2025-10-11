import React, { useContext } from "react";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import AuthContext from "../context/auth/authContext";
import { useLanguage } from "../context/LanguageContext";
import "../styles.css";

export default function Navbar1(props) {
  const authContext = useContext(AuthContext);
  const { lang, setLang, t } = useLanguage();

  if (!authContext) return null;

  const { logout, isAuthenticated } = authContext;

  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };

  return (
    <Navbar
      style={{
        position: "sticky",
        top: "0",
        zIndex: "100000",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "Mulish",
        backgroundColor: "#057affff", // أزرق فاتح باهت
      }}
    >
          <Navbar.Brand>
        <Link to="/" style={{ color: "#ffffffff", fontWeight: "bold", fontSize: "1.3rem" }}>
          Syrian Flight <i className="fas fa-plane-departure" />
        </Link>
      </Navbar.Brand>

      <Nav style={{ alignItems: "center" }}>
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
              <button
                type="button"
                onClick={handleLogout}
                style={{ border: "none", outline: "none", color: "white" }}
              >
                {t("logout") || "Logout"} <ExitToAppIcon />
              </button>
            </div>
          </>
        )}

        {/* Dropdown اختيار اللغة */}
        <div className="select-wrapper" style={{  color: "white", marginLeft: "1rem" }}>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            style={{ color: "white", textDecoration: "none" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#057affff")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#057affff")}
          >
            
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <span className="hamburger">
          <i onClick={props.changeDisplay} className="fa fa-bars" aria-hidden="true" />
        </span>
      </Nav>
    </Navbar>
  );
}