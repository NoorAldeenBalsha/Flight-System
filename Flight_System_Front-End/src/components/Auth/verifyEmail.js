import React,{ useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { id, verificationToken } = useParams();
  const history = useHistory();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
        `http://localhost:5000/api/user/auth/verify-email/${id}/${verificationToken}`
        );
        setMessage(res.data.message || "Email verified successfully!");
        setTimeout(() => history.push("/auth"), 3000); // بعد 3 ثواني تحويل لصفحة تسجيل الدخول
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };
    verify();
  }, [id, verificationToken, history]);

  return <div style={{ textAlign: "center", marginTop: "50px" }}>{message}</div>;
};

export default VerifyEmail;