import React, { useEffect, useState ,useRef} from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Overview from "./Overview.js";
import UsersPage from "./UsersDashboard.js";
import FlightsPage from "./FlightDashboard.js";
import TicketsPage from "./TicketDashboard.js";
import "../../css/adminDashboard.css";
import { useLanguage } from "../../context/LanguageContext.js";
import LoadingGif from "../../images/Rocket.gif";
import { apiFetch } from "../../services/apiFetch.js";


const AdminDashboard = () => {
  const [userStats, setUserStats] = useState(null);
  const [flightStats, setFlightStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  //=======================================================================================================
  //This one for dropdown list
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  //=======================================================================================================
  //This one for get data
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [usersRes, flightsRes, ticketsRes] = await Promise.all([
        apiFetch('/user/analytices/user'),
        apiFetch('/flights/analytics/flights'),
        apiFetch('/tickets/analytics/tickets'),
      ]);

      const users = await usersRes.json();
      const flights = await flightsRes.json();
      const tickets = await ticketsRes.json();

      setUserStats(users);
      setFlightStats(flights);
      setTicketStats(tickets);
    } catch (err) {
      console.error('Error while fetching:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  //=======================================================================================================
  // This one for not find information or loading
  if (loading)
    return (
      <div className="admin-loading-container">
        <img src={LoadingGif} alt="Loading..." className="admin-loading-gif" />
        <p>{t.loading_data}</p>
      </div>
    );

  if (!userStats||!flightStats||!ticketStats) return <p>{t.dash_no_data_available}</p>;
  //=======================================================================================================
  return (
    <div className="dashboard-container">
      <header className="admin-header" ref={dropdownRef}>
        {/* First Section */}
        <div className="header-btn" onClick={() => setOpen((p) => !p)}>
          <span> ☰{t.dash_Control_Panel}</span>
          <span className="arrow">{open ? "▲" : "▼"}</span>
        </div>
        {/* Second Section */}
        {open && (
          <div className="dropdown-menu">
            <Link to="/admin" onClick={() => setOpen(false)}>{t.dash_Home_title}</Link>
            <Link to="/admin/users" onClick={() => setOpen(false)}>{t.dash_users}</Link>
            <Link to="/admin/flights" onClick={() => setOpen(false)}>{t.dash_flight}</Link>
            <Link to="/admin/tickets" onClick={() => setOpen(false)}>{t.dash_ticket}</Link>
          </div>
        )}
      </header>
        {/* Third Section */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview userStats={userStats} flightStats={flightStats} ticketStats={ticketStats} />} />
          <Route path="users" element={<UsersPage data={userStats} />} />
          <Route path="flights" element={<FlightsPage data={flightStats} />} />
          <Route path="tickets" element={<TicketsPage data={ticketStats} />} />
        </Routes>
      </main>
    </div>
  );
  //=======================================================================================================
}

export default AdminDashboard;
