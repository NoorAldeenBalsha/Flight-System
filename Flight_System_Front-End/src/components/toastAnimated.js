import React, { useEffect, useState } from "react";
import "../styles.css";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";



export default function Toast({ show, message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // يختفي بعد الانيميشن
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`toast-container ${visible ? "fade-in" : "fade-out"} ${type}`}>
      <div className="toast-content">
        {type === "success" ? (
          <FaCheckCircle className="toast-icon success-icon" />
        ) : (
          <FaExclamationCircle className="toast-icon error-icon" />
        )}
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
}