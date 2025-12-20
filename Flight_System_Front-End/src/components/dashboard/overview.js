import React from "react";
import "../../css/overview.css";
import { useLanguage } from "../../context/LanguageContext";

const Overview = ({ userStats, flightStats, ticketStats }) => {
    
  const { t } = useLanguage();
  if (!userStats||!flightStats||!ticketStats) return <p>{t("dash_no_data_available")}</p>;
  return (
    <div className="overview">
      <h1> {t("dash_Home_title")}</h1>
      <p>{t("dash_Home_subtitle")} </p>

      <div className="overview-grid">
        <div className="card-overview">
          <h3> {t("dash_users")}</h3>
          <p className="number">{userStats.totalUsers}</p>
          <p>{t("dash_Total_Users")}</p>
        </div>

        <div className="card-overview">
          <h3> {t("dash_flight")}</h3>
          <p className="number">{flightStats.totalFlights}</p>
          <p>{t("dash_total_flights")}</p>
        </div>

        <div className="card-overview">
          <h3> {t("dash_ticket")}</h3>
          <p className="number">{ticketStats.totalTickets}</p>
          <p>{t("dash_total_tickets")}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;