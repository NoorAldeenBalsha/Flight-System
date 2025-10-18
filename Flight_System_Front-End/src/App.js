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
import Success from "./components/success";
import NotFound from "./components/404";
import Contact from "./components/contact";
import Order from "./components/order";
import { useLanguage } from "./context/LanguageContext"; 
import { BrowserRouter as  Switch, Route ,useLocation} from "react-router-dom";
import VerifyEmail from "./components/Auth/verifyEmail";
import RegistrationSuccess from "./components/Auth/registrationSuccess";
import Profile from "./components/profile";
import AuthProvider from "./context/auth/authProvider";
import AboutUs from "./components/aboutUs";
import Footer from "./components/footer";
import index from "./components";

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
          <Switch>
            <Route exact path="/auth" component={Auth} />
            <Footer/>
          </Switch>
        </div>
      ) : (
        // باقي الصفحات: اتجاه الصفحة حسب اللغة
        <div className={lang === "ar" ? "rtl" : "ltr"}>
          <AuthProvider>
          <Navbar display={display} changeDisplay={changeDisplay} />
          <Switch>
            <Route exact path="/" component={index} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/addproduct" component={AddProduct} />
            <Route exact path="/forget" component={Forget} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/registration-success" component={RegistrationSuccess}/>
            <Route exact path="/verify-email/:id/:verificationToken" component={VerifyEmail}/>
            <Route exact path="/checkout" component={Checkout} />
            <Route exact path="/success" component={Success} />
            <Route exact path="/fail" component={Fail} />
            <Route exact path="/deleteitems" component={DeleteItems} />
            <Route exact path="/reset-password" component={ResetPassword} />
            <Route exact path="/contact" component={Contact} />
            <Route exact path="/order" component={Order} />
            <Route exact path="/not-found" component={NotFound} />
            <Route exact path="/about-us" component={AboutUs} />
          </Switch>
          <Footer/>
          </AuthProvider>
        </div>
      )}
    </>
  );
}