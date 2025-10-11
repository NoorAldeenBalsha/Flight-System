import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/auth/authContext";
import { Link, Redirect } from "react-router-dom";
import "animate.css";
const Sidebar = (props) => {
  const { logout, isAuthenticated, user } = useContext(AuthContext);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = "0";
    console.log(props.display);
    console.log("app jas");
    // le.log(props.display);
    console.log("app jas");
    // console.log(props.display);
    if (props.display == 1) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "none";
  }, [props.display]);

  const handleLogout = (e) => {
    logout();
    props.changeDisplay();
  };
  return (
    <div
      className={
        props.display === 0
          ? "mainSide"
          : "mainSide minus animate__animated animate__fadeInRight"
      }
    >
      <div className="left">
        {isAuthenticated ? (
          <div className="name" style={{ fontFamily: "Mulish" }}>
            Hey, {user.name}
            <br />
          </div>
        ) : (
          ""
        )}
        <ul style={{ fontFamily: "Mulish" }}>
          <li onClick={props.changeDisplay}>
            {" "}
            <Link style={{ textDecoration: "none", color: "white" }} to="/">
              Home
            </Link>
          </li>
          {!isAuthenticated ? (
            <li
              onClick={(e) => {
                props.changeDisplay();
              }}
            >
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/auth"
              >
                SignUp/Login
              </Link>
            </li>
          ) : (
            <li style={{ cursor: "pointer" }} onClick={handleLogout}>
              Logout
            </li>
          )}
          {/* {!isAuthenticated ? <li>SignUp</li> : ""} */}

          {isAuthenticated && (
            <li onClick={props.changeDisplay}>
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/addProduct"
              >
                Add Items
              </Link>
            </li>
          )}
          {isAuthenticated ? (
            <li onClick={props.changeDisplay}>
              {" "}
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/deleteitems"
              >
                Delete Items
              </Link>
            </li>
          ) : (
            ""
          )}
          {isAuthenticated && (
            <li onClick={props.changeDisplay}>
              {" "}
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/order"
              >
                Orders
              </Link>
            </li>
          )}
          <li onClick={props.changeDisplay}>
            {" "}
            <Link
              style={{ textDecoration: "none", color: "white" }}
              to="/contact"
            >
              Contact Us
            </Link>
          </li>
          {isAuthenticated && (
            <li onClick={props.changeDisplay}>
              {" "}
              <Link
                style={{ textDecoration: "none", color: "white" }}
                to="/cart"
              >
                Cart
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="right" onClick={props.changeDisplay}>
        <i
          class="fa fa-times"
          aria-hidden="true"
          style={{ fontSize: "1.5rem" }}
        />
      </div>
    </div>
  );
};
export default Sidebar;
