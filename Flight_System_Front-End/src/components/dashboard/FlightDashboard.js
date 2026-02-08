import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  PieController, 
} from "chart.js";
import "../../css/flightDashboard.css";
import { useLanguage } from "../../context/LanguageContext";
import LoadingGif from "../../images/Rocket.gif";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  PieController 
);

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const FlightAnalytics = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");

  //=======================================================================================================
  // Function to fetch data from the server
    useEffect(() => {
    const fetchFlightStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/flights/analytics/flights", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch data ...");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error while fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlightStats();
  }, []);
  //=======================================================================================================
  // This one for not find information or loading
  if (loading)
    return (
      <div className="flight-loading-container">
        <img src={LoadingGif} alt="Loading..." className="flight-loading-gif" />
        <p>{t.loading_data}</p>
      </div>
    );

  if (!stats) return <p>{t.dash_no_data_available}</p>;
  //=======================================================================================================
  //Value for analytics
  const totalFlights = stats.totalFlights ;

  const archivedFlights = stats.archivedLast30d ;

  const statusDistribution = {
    labels: stats.statusDistribution.map((u) => u._id || "null"),
    datasets: [
      {
        label: t.dash_number_of_trips,
        data: stats.statusDistribution.map((u) => u.count),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
      },
    ],
  };

  const aircraftUsage = {
    labels: stats.aircraftUsage.map((u) => u._id || "null"),
    datasets: [
      {
        label:t.dash_number_of_uses,
        data: stats.aircraftUsage.map((u) => u.count),
        backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40"],
      },
    ],
  };

  const popularOrigins = {
    labels: stats.popularOrigins.map((u) => u._id || "null"),
    datasets: [
      {
        label: t.dash_departing_flights,
        data: stats.popularOrigins.map((u) => u.count),
        backgroundColor: "rgba(75,192,192,0.5)",
      },
    ],
  };

  const popularDestinations = {
    labels: stats.popularDestinations.map((u) => u._id || "null"),
    datasets: [
      {
        label: t.dash_descending_flights,
        data: stats.popularDestinations.map((u) => u.count),
        backgroundColor: "rgba(255,99,132,0.5)",
      },
    ],
  };

  const monthlyTrend = {
    labels: stats.monthlyTrend.map((u) => u._id),
    datasets: [
      {
        label: t.dash_number_of_monthly_trips,
        data: stats.monthlyTrend.map((u) => u.count),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };
  //=======================================================================================================
  return (
    <div className="flight-dashboard">
      <h1 className="page-title">{t.dash_trip_data_analysis_dashboard}</h1>
      {/* First Section */}

      <div className="stats-container">
        <div className="stat-card">
          <h3>{t.dash_total_flights}</h3>
          <p>{totalFlights}</p>
        </div>
        <div className="stat-card">
          <h3>{t.dash_archived_trips_from_the_last_30_days}</h3>
          <p>{archivedFlights}</p>
        </div>
      </div>
      {/* Second Section */}
      <div className="charts-grid">
        <div className="chart-box">
          <h4>{t.dash_distribution_of_flight_cases} </h4>
          <Pie data={statusDistribution} />
        </div>

        <div className="chart-box">
          <h3> {t.dash_use_of_aircraft_types}</h3>
          <Bar data={aircraftUsage} />
        </div>

        <div className="chart-box">
          <h3>{t.dash_the_most_active_cities}</h3>
          <Bar data={popularDestinations} />
        </div>

        <div className="chart-box">
          <h3>{t.dash_the_most_accessible_cities}</h3>
          <Bar data={popularOrigins} />
        </div>

        <div className="chart-box wide">
          <h3> {t.dash_monthly_trips_schedule}</h3>
          <Line data={monthlyTrend} />
        </div>
      </div>  
    </div>
  );
  //=======================================================================================================
};

export default FlightAnalytics;
