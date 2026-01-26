import React, { useState, useEffect } from "react";
import "./mobile.css";
import Navbar from "./components/Navbar";
import Auth from "./components/auth/auth";
import Fail from "./components/fail";
import Forget from "./components/auth/Forget";
import ResetPassword from "./components/auth/resetPassword";
import NotFound from "./components/404";
import Contact from "./components/contact";
import { useLanguage } from "./context/LanguageContext"; 
import { Routes, Route ,useLocation} from "react-router-dom";
import VerifyEmail from "./components/auth/verifyEmail";
import RegistrationSuccess from "./components/auth/registrationSuccess";
import Profile from "./components/profile";
import AuthProvider from "./context/auth/authProvider";
import AboutUs from "./components/aboutUs";
import Footer from "./components/footer";
import Home from "./components/home";
import FlightsPage from "./components/flightPage";
import SeatSelectionPage from "./components/seatSelection";
import PaymentSuccess from "./components/paymentSuccess";
import AdminDashboard from "./components/dashboard/adminDashboard";
import AdminRoute from "./adminRoute";

export default function App() {
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