import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "../../css/ticketDashboard.css";
import LoadingGif from '../../images/Spinner.gif';
import { useLanguage } from "../../context/LanguageContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const TicketStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState({}); 
  const token = localStorage.getItem("accessToken");
  const { t, lang } = useLanguage();
  //=======================================================================================================
  // Function to fetch data from the server
    useEffect(() => {  
      const fetchTicketStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tickets/analytics/tickets"); 
        if (!res.ok) throw new Error("Failed to fetch data ...");
        const data = await res.json();
        setStats(data);
        
        if (data.topUsers && data.topUsers.length > 0) {
          const requests = data.topUsers.map(user =>
            fetch(`http://localhost:5000/api/user/${user._id}`, { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.json())
              .catch(err => {
                console.error("Error fetching user", user._id, err);
                return { id: user._id, name: user._id }; 
              })
          );

          const responses = await Promise.all(requests);
          const namesMap = {};
          responses.forEach(res => {
            namesMap[res.id || res._id] = res.fullName; 
          });
          setUserNames(namesMap);
        }

      } catch (err) {
        console.error("Error while fetching:", err);
      } finally {
        setLoading(false);
      }
  };
  fetchTicketStats();
  }, []);
  //=======================================================================================================
  // This one for not find information or loading
  if (loading) return (
        <div className="ticket-loading-container">
        <img src={LoadingGif} alt="Loading..." className="ticket-loading-gif" />
        <p>
        {t("loading_data")}
        </p>
        </div>
    );

  if (!stats) return <p>{t("dash_no_data_available")} </p>; 
  //=======================================================================================================
  //Value for analytics
  const revenueData = {
    labels: stats.monthlyTrend.map((m) => m._id),
    datasets: [
      {
        label: t("dash_total_revenue"),
        data: stats.monthlyTrend.map((m) => m.totalRevenue),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: t("dash_number_of_tickets_sold"),
        data: stats.monthlyTrend.map((m) => m.sold),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const seatNumber = {
    labels: stats.seatNumber.map((u) => u._id),
    datasets: [
      {
        label: t("dash_seat_number"),
        data: stats.seatNumber.map((u) => u.count),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.3)",
      },
    ],
  };

  const topUsersData = {
    labels: stats.topUsers.map((u) => userNames[u._id]),
    datasets: [
      {
        label:t("dash_number_tickets"),
        data: stats.topUsers.map((u) => u.ticketsBought),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.3)",
      },
    ],
  };
  //=======================================================================================================
  return (
    <div className="ticket-stats">
      <h2>{t("dash_sales_statistics")}</h2>
      {/*First Section*/}
      <div className="ticket-stats-cards">
        <div className="ticket-card">
          <h3>{t("dash_total_tickets")}</h3>
          <p>{stats.totalTickets}</p>
        </div>
        <div className="ticket-card">
          <h3>{ t("dash_total_revenue")}</h3>
          <p>${stats.revenueStats.totalRevenue}</p>
        </div>
        <div className="ticket-card">
          <h3>{t("dash_average_price")}</h3>
          <p>${stats.revenueStats.avgPrice.toFixed(2)}</p>
        </div>
      </div>
      {/*Second Section*/}
      <div className="ticket-charts-grid">
        <div className="ticket-chart-box">
          <h4> {t("dash_monthly_revenues_and_sales")}</h4>
          <Bar data={revenueData} />
        </div>

        {stats.seatNumber.length > 0 && (
          <div className="ticket-chart-box">
            <h4> {t("dash_seating_categories_distribution")}</h4>
            <Line data={seatNumber} />
          </div>
        )}

        <div className="ticket-chart-box">
          <h4> {t("dash_top_purchasing_users")}</h4>
          <Line data={topUsersData} /></div>
      </div>
    </div>
  );
  //=======================================================================================================
};

export default TicketStats;