import React, { useState, useEffect } from "react";
import "./styles.css";
import "./mobile.css";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import Auth from "./components/Auth/auth";
import Sidebar from "./components/sideBar";
import DeleteItems from "./components/deleteItems";
import AddProduct from "./components/addProduct";
import Fail from "./components/fail";
import Forget from "./components/Auth/Forget";
import ResetPassword from "./components/Auth/resetPassword";
import Checkout from "./components/checkout";
import NotFound from "./components/404";
import Contact from "./components/contact";
import { useLanguage } from "./context/LanguageContext"; 
import { Routes, Route ,useLocation} from "react-router-dom";
import VerifyEmail from "./components/Auth/verifyEmail";
import RegistrationSuccess from "./components/Auth/registrationSuccess";
import Profile from "./components/profile";
import AuthProvider from "./context/auth/authProvider";
import AboutUs from "./components/aboutUs";
import Footer from "./components/footer";
import Home from "./components/home";
import FlightsPage from "./components/flightPage";
import SeatSelectionPage from "./components/seatSelection";
import PaymentSuccess from "./components/paymentSuccess";

export default function App() {
  const [display, setDisplay] = useState(0);
  const { lang } = useLanguage();
  const location = useLocation();
  const changeDisplay = () => setDisplay(display ^ 1);

  const isAuthPage = location.pathname === "/auth";

  // منع التمرير عند فتح الـ Sidebar
  useEffect(() => {
    if (display === 1) {
      document.body.style.overflow = "hidden";
      document.documentElement.scrollTop = 0;
    } else {
      document.body.style.overflow = "";
    }
  }, [display]);

  useEffect(() => {
    if (!navigator.onLine) alert("You Are Offline");
  }, []);

  return (
    <>
      {display === 1 && <Sidebar display={display} changeDisplay={changeDisplay} />}

      {isAuthPage ? (
        // صفحة Auth: اتجاه الصفحة ثابت LTR
        <div className="ltr">
          <Navbar
            display={display}
            changeDisplay={changeDisplay}
            className={lang === "ar" ? "rtl" : "ltr"} // Navbar فقط يعكس اللغة
          />
          <Routes>
            <Route exact path="/auth" element={<Auth />} />
          </Routes>
          <Footer/>
        </div>
      ) : (
        // باقي الصفحات: اتجاه الصفحة حسب اللغة
        <div className={lang === "ar" ? "rtl" : "ltr"}>
          <AuthProvider>
          <Navbar display={display} changeDisplay={changeDisplay} />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/cart" element={<Cart />} />
            <Route exact path="/addproduct" element={<AddProduct />} />
            <Route exact path="/forget" element={<Forget />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route exact path="/registration-success" element={<RegistrationSuccess />}/>
            <Route exact path="/verify-email/:id/:verificationToken" element={<VerifyEmail />}/>
            <Route exact path="/checkout" element={<Checkout />} />
            <Route exact path="/fail" element={<Fail />} />
            <Route exact path="/deleteitems" element={<DeleteItems />} />
            <Route exact path="/reset-password" element={<ResetPassword />} />
            <Route exact path="/contact" element={<Contact />} />
            <Route exact path="/paymentSuccess" element={<PaymentSuccess/>}/>
            <Route exact path="/about-us" element={<AboutUs />} />
            <Route exact path="/flights" element={<FlightsPage />} />
            <Route exact path="/seat-selection" element={<SeatSelectionPage />} />
          </Routes>
          <Footer/>
          </AuthProvider>
        </div>
      )}
    </>
  );
}