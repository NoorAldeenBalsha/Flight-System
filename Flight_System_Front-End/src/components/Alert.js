import React, { useContext } from "react";
import authContext from "../context/auth/authContext";
import ErrorList from "./ErrorList";
import { Toast } from "react-bootstrap";
import "animate.css";

const Alerts = () => {
  const { errors } = useContext(authContext);

  if (!errors || errors.length === 0) return null;

  return (
    <div className="alerts">
      {errors.map((err, index) => (
        <div key={index} className="alert alert-danger">
          {typeof err === "string" ? err : JSON.stringify(err)}
        </div>
      ))}
    </div>
  );
};

export default Alerts;
