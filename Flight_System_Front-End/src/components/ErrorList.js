import React, { useState } from "react";
import { Toast, Header, Body, Row, Col, Button } from "react-bootstrap";
import "animate.css";

const ErrorList = ({ errors }) => {
  if (!errors) return null;

  return (
    <div>
      {Array.isArray(errors) ? (
        errors.map((err, index) => (
          <div key={index} className="error-item">
            {err.msg || err.message || JSON.stringify(err)}
          </div>
        ))
      ) : typeof errors === "object" ? (
        <div className="error-item">{errors.message || JSON.stringify(errors)}</div>
      ) : (
        <div className="error-item">{errors}</div>
      )}
    </div>
  );
};

export default ErrorList;