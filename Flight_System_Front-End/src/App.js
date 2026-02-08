import React, { useState, useEffect } from "react";
import "./mobile.css";
import Auth from "./components/Auth/Auth.js";
import Fail from "./components/Fail.js";
import ResetPassword from "./components/Auth/ResetPassword.js";
import NotFound from "./components/404";
import Contact from "./components/Contact.js";
import { useLanguage } from "./context/LanguageContext"; 
import { Routes, Route ,useLocation} from "react-router-dom";
import VerifyEmail from "./components/Auth/VerifyEmail.js";
import RegistrationSuccess from "./components/Auth/RegistrationSuccess.js";
import Profile from "./components/Profile.js";
import AuthProvider from "./context/auth/authProvider";
import AboutUs from "./components/AboutUs.js";
import Footer from "./components/Footer.js";
import Home from "./components/Home.js";
import FlightsPage from "./components/FlightPage.js";
import SeatSelectionPage from "./components/SeatSelection.js";
import PaymentSuccess from "./components/PaymentSuccess.js";
import AdminDashboard from "./components/dashboard/AdminDashboard.js";
import AdminRoute from "./adminRoute";
import Forget from "./components/Auth/Forget.js";
import Unity from "./components/Unity.js";
import Navbar from "./components/Navbar.js"

function App() {
  const [display, setDisplay] = useState(0);
  const { lang } = useLanguage();
  const location = useLocation();
  const changeDisplay = () => setDisplay(display ^ 1);
  const isAuthPage = location.pathname === "/auth";
  //=======================================================================================================
  useEffect(() => {
    if (display === 1) {
      document.body.style.overflow = "hidden";
      document.documentElement.scrollTop = 0;
    } else {
      document.body.style.overflow = "";
    }
  }, [display]);
  //=======================================================================================================
  useEffect(() => {
    if (!navigator.onLine) alert("You Are Offline");
  }, []);
  //=======================================================================================================
  return (
    <>
      {isAuthPage ? (
        <div>
          <div className={lang === "en" ? "ltr" : "rtl"}>
            <Navbar display={display}  changeDisplay={changeDisplay}/>
            </div>
          <Routes>
            <Route exact path="/auth" element={<Auth />} />
          </Routes>
          <Footer/>
        </div>
      ) : (
        <div className={lang === "ar" ? "rtl" : "ltr"}>
          <AuthProvider>
          <Navbar display={display} changeDisplay={changeDisplay} />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/unity" element={<Unity />} />
            <Route exact path="/forget" element={<Forget />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route exact path="/registration-success" element={<RegistrationSuccess />}/>
            <Route exact path="/verify-email/:id/:verificationToken" element={<VerifyEmail />}/>
            <Route exact path="/fail" element={<Fail />} />
            <Route exact path="/not-found" element={<NotFound />} />
            <Route exact path="/reset-password" element={<ResetPassword />} />
            <Route exact path="/contact" element={<Contact />} />
            <Route exact path="/paymentSuccess" element={<PaymentSuccess/>}/>
            <Route exact path="/about-us" element={<AboutUs />} />
            <Route exact path="/flights" element={<FlightsPage />} />
            <Route exact path="/seat-selection" element={<SeatSelectionPage />} />
            <Route exact path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
          </AuthProvider>
          <Footer/>
        </div>
      )}
    </>
  );
}
export default App;