import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  Pie,
  Line,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
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
import "../../css/userDashboard.css"
import LoadingGif from "../../images/Rocket.gif";
import icon from '../../images/close.png'
import { useLanguage } from "../../context/LanguageContext";
import Toast from "../toastAnimated";
import API from "../../services/api";

const UsersPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken")
  const { t } = useLanguage();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const defaultImage ="https://cdn-icons-png.flaticon.com/512/847/847969.png";
  //=======================================================================================================
  // This one to get all analytics for users
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/analytices/user");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);
  //=======================================================================================================
  // This one to get list of all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res =  await axios.get(
            "http://localhost:5000/api/user",
            { headers: { Authorization: `Bearer ${token}` } })
        setUsersList(res.data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  //=======================================================================================================
  // Handle user delete
  const handleDeleteUser = async (userId) => {
  try {
     await axios.delete(`http://localhost:5000/api/user/delete/${userId}`, {
       headers: {Authorization: `Bearer ${token}`,},
    });
    setToast({ show: true, message:t.dash_User_deleted_successfully , type: "success" });
  } catch (error) {
    console.error("Delete error:", error);
    setToast({ show: true, message:t.dash_error_deleting_user , type: "error" });

  }
};
  const handleUpdateRole = async (userId, newRole) => {
  try {
    if (!userId) throw new Error("User ID not found!");

    const cleanData = { role: newRole };

    await API.patch(
      `/user/update/${userId}`,
      cleanData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // تحديث الحالة محلياً
    setUsersList((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, role: newRole } : u
      )
    );

    setToast({ show: true, message:"User role updated successfully" , type: "success" });
  } catch (err) {
    setToast({ show: true, message:"User role cannot updated " , type: "error" });
  }
};
  //=======================================================================================================
  // This one for not find information or loading
  if (loading) return (
      <div className="user-loading-container">
        <img src={LoadingGif} alt="Loading..." className="user-loading-gif" />
        <p>{t.loading_data}</p>
      </div>
    );

    if (!analytics) return <p>{t.dash_no_data_available}</p>;
  //=======================================================================================================
  //Value for analytics
  const totalUsers = analytics.totalUsers ;
  const activeUsers30d = analytics.activeUsers30d ;

  const roleLabels = analytics.roleDistribution?.map(r => r._id) || "null";
  const roleCounts = analytics.roleDistribution?.map(r => r.count) || "null";

  const genderLabels = analytics.genderDistribution?.map(g => g._id) || "null";
  const genderCounts = analytics.genderDistribution?.map(g => g.count) || "null";

  const verifiedCounts = [
    analytics.verifiedStats?.find(v => v._id === true)?.count || "null",
    analytics.verifiedStats?.find(v => v._id === false)?.count || "null",
  ];

  const verifiedLabels = [t.dash_Verified, t.dash_Unverified];

  const birthCountries = analytics.birthCountryDistribution?.map(c => c._id) || "null";
  const birthCounts = analytics.birthCountryDistribution?.map(c => c.count) || "null";

  const residenceCountries = analytics.residenceCountryDistribution?.map(c => c._id) ||"null";
  const residenceCounts = analytics.residenceCountryDistribution?.map(c => c.count) || "null";
//=======================================================================================================
  return (
    <>
      {toast.show && ( <Toast 
        show={toast.show}message={toast.message}type={toast.type}onClose={() => setToast({ ...toast, show: false })}/>)}

      <div className="user-dashboard">
        <h1 className="page-title-user">{t.dash_User_Analytics_Dashboard}</h1>
        {/* First Section */}
        <div className="stats-cards-user">
          <div className="card-user">
            <h3>{t.dash_Total_Users}</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="card-user">
            <h3> {t.dash_Active_accounts_in_the_last_30_days}</h3>
            <p>{activeUsers30d}</p>
          </div>
        </div>

        {/* Second Section */}
        <div className="charts-grid-user">
          <div className="chart-box-user">
            <h3> {t.dash_Role_Distribution}</h3>
            <Pie data={{
              labels: roleLabels,
              datasets: [{ data: roleCounts, backgroundColor: ["#007bff", "#ffc107", "#dc3545"] }],
            }} />
          </div>

          <div className="chart-box-user">
            <h3> {t.dash_Gender_distribution}</h3>
            <Pie data={{
              labels: genderLabels,
              datasets: [{ data: genderCounts, backgroundColor: ["#36a2eb", "#ff6384", "#999999"] }],
            }} />
          </div>

          <div className="chart-box-user">
            <h3>{t.dash_Account_verification}</h3>
            <Bar
              data={{
                labels: verifiedLabels,
                datasets: [
                  {
                    label: t.dash_Number_of_users,
                    data: verifiedCounts,
                    backgroundColor: ["#28a745", "#6c757d"],
                  },
                ],
              }}
            />
          </div>

          <div className="chart-box-user">
            <h3> {t.dash_Countries_of_birth}</h3>
            <Bar
              data={{
                labels: birthCountries,datasets: [{ label:t.dash_Number_of_users, data: birthCounts, backgroundColor: "#17a2b8" }],
              }}
            />
          </div>

          <div className="chart-box-user">
            <h3>{t.dash_Countries_of_residence}</h3>
            <Bar
              data={{
                labels: residenceCountries,
                datasets: [{ label: t.dash_Number_of_users, data: residenceCounts, backgroundColor: "#6610f2" }],
              }}
            />
          </div>
        </div>

        {/* Third Section */}
        <div className="users-table">
          <h2> {t.dash_User_List}</h2>
          {loading ? (
            <p>{t.dash_Loading_users}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t.dash_image}</th>
                  <th>{t.dash_name}</th>
                  <th>{t.dash_email}</th>
                  <th>{t.dash_role}</th>
                  <th>{t.dash_delete}</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length ? (
                  usersList.map((user, i) => (
                    <tr key={i}>
                      <td>
                        <img
                          src={user.picture || defaultImage}
                          alt="user"
                          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                        />
                      </td>
                      <td>{user.fullName || "null"}</td>
                      <td>{user.email || "-"}</td>
                      <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                      <td>
                        <img
                          src={icon }
                          alt="user"
                          className="user-delete-icone"
                          onClick={()=>handleDeleteUser(user._id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}> {t.dash_not_fetch_user_data}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
    
  );
  //=======================================================================================================
};

export default UsersPage;