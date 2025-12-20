import React,{ useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
const VerifyEmail = () => {
  const { id, verificationToken } = useParams();
  const history = useNavigate();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get(
        `/user/auth/verify-email/${id}/${verificationToken}`
        );
        setMessage(res.data.message || "Email verified successfully!");
        setTimeout(() => history.push("/auth"), 5000);
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };
    verify();
  }, [id, verificationToken, history]);

  return <div style={{ textAlign: "center", marginTop: "50px" }}>{message}</div>;
};

export default VerifyEmail;