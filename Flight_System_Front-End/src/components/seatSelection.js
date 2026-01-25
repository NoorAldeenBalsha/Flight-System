import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "../css/seatSelection.css";
import { useLocation } from "react-router-dom";
import Toast from "./toastAnimated";
import API from "../services/api";

const SeatSelection = () => {
  const { t, lang } = useLanguage();
  const [layout, setLayout] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const loacation=useLocation();
  const flight =loacation.state
  const token = localStorage.getItem("accessToken");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  //=======================================================================================================
  // Fetch the current user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
     
        const res = await API.get(
          "/user/current-user",
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
  // Get all Ticket for flight
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await API.get(`/tickets/flight/${flight._id}`);
        setLayout(res.data.layout);
      } catch (err) {
        console.error("Error fetching seat data", err);
      }
    };
    fetchSeats();
  }, [flight._id]);
  //=======================================================================================================
  // Make value for ticket like( departure ,boardingStart,boardingEnd ,time , date)
  const departure = new Date(flight?.departureTime);
  const boardingStart = new Date(departure.getTime() - 45 * 60 * 1000); 
  const boardingEnd = new Date(boardingStart.getTime() + 30 * 60 * 1000);
  const formatTime = (date) =>  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const formatDate = (date) =>  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  //=======================================================================================================
  // know any seat is available
  const handleSeatSelect = (seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat);
    }
  };
  //=======================================================================================================
  // hundel to complet pay seat
  const handleReserve = async () => {

    try {
      const bookingResponse=await API.post('/tickets/book', 
      {      
        seatId: selectedSeat._id,
      userId: user._id,
      price: selectedSeat.price,
      seatClass: selectedSeat.seatClass,
      seatSide: selectedSeat.seatSide,
      seatPosition:selectedSeat.seatPosition,
      seatLetter:selectedSeat.seatLetter,
      seatNumber: selectedSeat.seatNumber}
      );
        setToast({ show: true, message:t.select_Seat_pending_success , type: "success" });
        console.log(selectedSeat._id)
        const paymentResponse=await API.post('/payment/paypal',
          { ticketId:selectedSeat._id,
            userId:user._id
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
          console.log(" paymentResponse : ",paymentResponse)
       const approveLink= paymentResponse.data.links?.find((link)=>link.rel==="approve")?.href;
        console.log("approveLink : ",approveLink)
        if(approveLink){
          const redirectUrl = `${approveLink}&ticketId=${selectedSeat._id}&userId=${user._id}`;
          window.location.href = redirectUrl;
        }
        else{
          setToast({ show: true, message:t.select_Seat_approveLink , type: "error" });
      }
    } catch (err) {
      setToast({ show: true, message:t.select_Seat_reseving_seat , type: "error" });
    }
  };
  //=======================================================================================================
  return (
    <>
    {toast.show && (
        <Toast 
            show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>
          )}
        
        <div className="seat-page">
          <div className="seat-selection-page">
            <div className="seat-header">
              <h1>{t.select_Seat_title}</h1>
              <p>{t.select_seat_sub}</p>
            </div>

            <div className="aircraft-container">
              <div className="aircraft-window"></div>

              <div className="aircraft-scroll">
                <div className="aircraft-body">
                  {layout.map((rowData, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                      <span className="row-number">{rowData.row}</span>
                      <div className="row-seats">
                        {rowData.seats.map((seat, seatIndex) => (
                          <div
                            key={seatIndex}
                            className={`seat ${
                              seat.status === "available"
                                ? "available"
                                : seat.status === "sold"
                                ? "sold"
                                : "pending"
                            } ${selectedSeat?.seatNumber === seat.seatNumber ? "selected" : ""}`}
                            onClick={() => seat.status === "available" && handleSeatSelect(seat)}
                          >
                            {seat.seatLetter}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aircraft-tail"></div>
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>{t.select_Seat_Available}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color reserved"></div>
                <span>{t.select_Seat_Reserved}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color selected"></div>
                <span > {t.select_Seat_Selected} </span>
              </div>
            </div>
          </div>

        {selectedSeat && (
          <div className="flight-ticket-overlay" onClick={() => setSelectedSeat(null)}>
            <div className="flight-ticket-modal"onClick={(e) => e.stopPropagation()}>
              <div className="boarding-pass">
                {/* left section */}
                <div className="boarding-pass-left">
                  <div className="bp-header">
                    <h2>{t.syrian_Flight}</h2>
                    <span>{t.select_Seat_ticket_sub}</span>
                  </div>

                  <div className="bp-info">
                    <div><strong>{t.flight_number}: </strong> {flight?.flightNumber }</div>
                    <div><strong>{t.select_Seat_Boarding}: </strong> {formatTime(boardingStart)}</div>
                    <div><strong>{t.select_Seat_Boarding_till}: </strong> {formatTime(boardingEnd)}</div>
                    <div><strong>{t.select_Seat_Seat}: </strong> {selectedSeat?.seatNumber}</div>
                    <div><strong>{t.select_Seat_Class}: </strong> 
                    {typeof selectedSeat.seatClass === "Object" ? selectedSeat.seatClass[lang] : selectedSeat.seatClass[lang]}</div>
                    <div><strong>{t.select_Seat_seatPosition}: </strong> 
                    {typeof selectedSeat.seatPosition === "Object" ? selectedSeat.seatPosition[lang] : selectedSeat.seatPosition[lang]}</div>
                    <div><strong>{t.select_Seat_seatSide}: </strong> 
                    {typeof selectedSeat.seatSide === "object" ? selectedSeat.seatSide[lang] : selectedSeat.seatSide[lang]}</div>
                    <div><strong>{t.select_Seat_status}: </strong> {selectedSeat?.status}</div>
                    <div><strong>{t.select_Seat_price}: </strong> {selectedSeat?.price}</div>
                  </div>

                  <div className="bp-barcode-vertical"></div>
                  <div className="bp-ticket-num">
                    E-TKT: {selectedSeat?._id }
                  </div>
                </div>

                {/*  right section */}
                <div className="boarding-pass-right">
                  <div className="bp-right-header">
                    <span className="bp-class">
                      {typeof selectedSeat.seatClass === "Object" ? selectedSeat.seatClass[lang] : selectedSeat.seatClass[lang]}
                    </span>
                  </div>

                  <div className="bp-main">
                    <div className="bp-row">
                      <div><strong>{t.select_Seat_ticket_from}: </strong> 
                      {typeof flight.origin === "object" ? flight.origin[lang] : flight.origin}</div>
                      <div><strong>{t.select_Seat_ticket_to}: </strong> 
                      {typeof flight.destination === "object" ? flight.destination[lang] : flight.destination}</div>
                    </div>

                    <div className="bp-row">
                      <div><strong>{t.select_Seat_ticket_date}: </strong> {formatDate(departure)}</div>
                      <div><strong>{t.select_Seat_ticket_time}: </strong> {formatTime(departure)}</div>
                    </div>

                    <div className="bp-row">
                      <div><strong>{t.flights_gate}: </strong> {flight?.gate || "A12"}</div>
                      <div><strong>{t.select_Seat_Seat}: </strong> {selectedSeat?.seatNumber}</div>
                    </div>

                    <div className="bp-row">
                      <div><strong>{t.flight_number}: </strong> {flight?.flightNumber || "EK2314"}</div>
                      
                    </div>
                      <div className="bp-row">
                      <div><strong>{t.select_Seat_status}: </strong> {flight?.status || "Scheduled"}</div>
                    </div>
                  </div>

                  <div className="bp-barcode-horizontal"></div>
                </div>
              </div>

              {/* buttons */}
              <div className="flight-ticket-footer">
                <button className="ticket-btn-reserve" onClick={handleReserve}>
                  {t.select_Seat_ticket_Book_now}
                </button>
                <button className="ticket-btn-close" onClick={() => setSelectedSeat(null)}>
                  {t.select_Seat_ticket_close}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>  
    </>
  );
};

export default SeatSelection;