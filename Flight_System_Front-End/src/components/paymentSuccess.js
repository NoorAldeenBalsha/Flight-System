import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import '../css/paymentSuccess.css'
import LoadingGif from '../images/Spinner.gif'
import icon from '../images/check.png'
import { useNavigate } from "react-router-dom";
import Toast from "./toastAnimated";
import { useLanguage } from "../context/LanguageContext";

function PaymentSuccess() {
    const { t, lang } = useLanguage();
    const history = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [ticket, setTicket] = useState(null);
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get("token");
    const userId = searchParams.get("userId");
    const ticketId = searchParams.get("ticketId");
    const token = localStorage.getItem("accessToken");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    //=======================================================================================================
    useEffect(() => {
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      }, [lang]);
    //=======================================================================================================
    useEffect(() => {
        const capturePayment = async () => {
        if (!orderId || !token) return;

        try {
            const res = await axios.post(
            "http://localhost:5000/api/payment/paypal/capture",
            { orderId ,ticketId,userId},
            {
                headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                },
            }
            );

            if (res.data.status === "COMPLETED") {
            setToast({ show: true, message:t("Payment_successful") , type: "success" });
            } else {
            setToast({ show: true, message:t("Payment_not_completed") , type: "error" });
            }
        } catch (err) {
            console.error("💥 Capture error:", err);
            setToast({ show: true, message:t("select_Seat_approveLink") , type: "error" });
        }
        };

        capturePayment();
    }, [orderId, token]);
    //=======================================================================================================
    // Fetch the current user data when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
        try {
        
            const res = await axios.get(
            "http://localhost:5000/api/user/current-user",
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user:", err);
        }finally{
        }
        };
    
        fetchUser();
    }, [user]);
    //=======================================================================================================
    // Get Ticket informations
    useEffect(() => {
        const fetchTicket = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/tickets/${ticketId}`);
            setTicket(res.data)
        } catch (err) {
            console.error("Error fetching seat data", err);
        }
        };
        fetchTicket();
    }, [ticket]);
    //=======================================================================================================
    if (!user || !ticket)
    return (
        <div className="loading-container">
        <img src={LoadingGif} alt="Loading..." className="loading-gif" />
        <p>
        {t("loading_data")}
        </p>
        </div>
    )
    //=======================================================================================================

  return (
    <>
    {toast.show && (
            <Toast 
                show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>
              )}
  <div className="purchase-success-page">
    <div className="success-container">
      
  <img src={icon} className="success-icon"></img>
      <h1 className="success-title">{t("successfully_purchased")}</h1>
      <p className="success-message">{t("thanks_for_choose")}</p>

      <div className="ticket-info">
        <h2>{t("Ticket_Information")}</h2>
        <div className="info-row">
          <span>{t("ticket_id")}</span>
          <span>#{ticketId}</span>
        </div>
        <div className="info-row">
          <span> {t("full_name")}</span>
          <span>{user.fullName}</span>
        </div>
        <div className="info-row">
          <span>{t("seat_number")}</span>
          <span>{ticket.seatNumber}</span>
        </div>
        <div className="info-row">
          <span>{t("select_Seat_price")}</span>
          <span>{ticket.price} USD</span>
        </div>
        <div className="info-row">
          <span>{t("flights_status")}</span>
          <span className="status-paid">{t("status_paid")}</span>
        </div>
      </div>
 <button className="home-btn" onClick={()=> history("/")}>
        {t("go_back_home")}
      </button>
    </div>
  </div>
  </>
  );

}

export default PaymentSuccess;