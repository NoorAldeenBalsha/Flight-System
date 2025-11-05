import React, { useEffect } from "react";
import "../css/home.css";
import "../mobile.css";
import "animate.css";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import about1 from"../images/about1.jpg"
import about2 from"../images/about2.jpg"
import private_flight from"../images/private-flight.jpg"
import business_aviation from"../images/business-aviation.jpg"
import air_cargo from"../images/air-cargo.jpg"
import flight_services from"../images/flight-services.jpg"
import AllTime from"../images/AllTime.png"
import Local_Global_Reach from"../images/Local_&_Global_Reach.jpg"
import Quality_Safety from"../images/Quality_Safety.png"
import Trusted_Partnerships from"../images/Trusted_Partnerships.png"

const Home = (props) => {
    const { lang, t } = useLanguage();
    const history = useNavigate();

    const services = [
    {
      img: private_flight,
      title: t("solution_private_title"),
      desc: t("solution_private_desc"),
    },
    {
      img: business_aviation,
      title: t("solution_business_title"),
      desc: t("solution_business_desc"),
    },
    {
      img: air_cargo,
      title: t("solution_cargo_title"),
      desc: t("solution_cargo_desc"),
    },
    {
      img: flight_services,
      title: t("solution_services_title"),
      desc: t("solution_services_desc"),
    },
    ];

    const reasons = [
    {
      img: Local_Global_Reach,
      title: t("whyus_global_title"),
      desc: t("whyus_global_desc"),
    },
    {
      img: AllTime,
      title: t("whyus_ready_title"),
      desc: t("whyus_ready_desc"),
    },
    {
      img:Trusted_Partnerships,
      title: t("whyus_partnership_title"),
      desc: t("whyus_partnership_desc"),
    },
    {
      img:Quality_Safety,
      title: t("whyus_quality_title"),
      desc: t("whyus_quality_desc"),
    },
    ];

     const testimonials = [
    {
      name: t("testi_client1_name"),
      role: t("testi_client1_role"),
      quote: t("testi_client1_quote"),
    },
    {
      name: t("testi_client2_name"),
      role: t("testi_client2_role"),
      quote: t("testi_client2_quote"),
    },
    {
      name: t("testi_client3_name"),
      role: t("testi_client3_role"),
      quote: t("testi_client3_quote"),
    },
    ];

    const goToAbout = () => {
    history("/about-us");
    };

    const scrollToNextSection = () => {
    const nextSection = document.getElementById("about-section");
    if (nextSection) nextSection.scrollIntoView({ behavior: "smooth" });
    };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);


  return (
    <>
      {/* HERO */}
      <section className={`hero-section ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">{t("index_hero_title")}</h1>
        <p className="hero-subtitle">{t("index_hero_subtitle")}</p>
        <button className="hero-btn" onClick={scrollToNextSection}>
          {t("index_hero_button")}
        </button>
      </div>
      </section>

      {/* ABOUT */}
      <section id="about-section" className={`about-section ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="about-container">
        <div className="about-text">
          <h2>{t("index_about_title")}</h2>
          <p>{t("index_about_description")}</p>
          <button className="about-btn" onClick={goToAbout}>
            {t("index_about_button")}
          </button>
        </div>

        <div className="about-images">
          <div className="about-img about-img1">
            <img src={about1} alt="about" />
          </div>
          <div className="about-img about-img2 ">
            <img src={about2} alt="about" />
          </div>
        </div>
      </div>
      </section>

      {/*SERVICE */}
      <section id="flight-solutions" className={`flight-solutions ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="solutions-header">
        <h2>{t("solution_title")}</h2>
        <p>{t("solution_subtitle")}</p>
      </div>

      <div className="solutions-grid">
        {services.map((item, index) => (
          <div key={index} className="solution-card">
            <div className="solution-image">
              <img src={item.img} alt={item.title} />
            </div>
            <div className="solution-content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* why_us */}
      <section id="why-us" className={`whyus-section ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="whyus-header">
        <span className="whyus-badge">{t("whyus_badge")}</span>
        <h2>{t("whyus_title")}</h2>
        <p>{t("whyus_subtitle")}</p>
      </div>

      <div className="solutions-grid">
        {reasons.map((reason, index) => (
          <div key={index} className="whyus-card">
            <div className="solution-image"> <img src={reason.img} alt={reason.title} /></div>
             <div className="solution-content">
            <h3>{reason.title}</h3>
            <p>{reason.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className={`testimonials-section ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className="testimonials-header">
        <span className="testimonials-badge">{t("testi_badge")}</span>
        <h2>{t("testi_title")}</h2>
        <p>{t("testi_subtitle")}</p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((tst, index) => (
          <div key={index} className="testimonial-card">
            <p className="testimonial-quote">“{tst.quote}”</p>
            <div className="testimonial-info">
              <h3>{tst.name}</h3>
              <span>{tst.role}</span>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className={`contact-section ${lang === "ar" ? "rtl" : "ltr"}`}>
      <div className={`contact-container ${lang === "ar" ? "rtl" : ""}`}>
      <div className="contact-box">
        {/* ==== Left Side: Form ==== */}
        <div className="contact-form">
          <h2>{t("contact_title")}</h2>
          <form>
            <div className="input-group">
              <i className="fas fa-user"></i>
              <input type="text" placeholder={t("contact_name")} required />
            </div>
            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder={t("contact_email")} required />
            </div>
            <div className="input-group textarea">
              <i className="fas fa-comment"></i>
              <textarea placeholder={t("contact_message")} required></textarea>
            </div>
            <button type="submit" className="send-btn">
              {t("contact_send")}
            </button>
          </form>
        </div>

        {/* ==== Right Side: Illustration ==== */}
        <div className="contact-illustration">
          <img
            src="https://img.freepik.com/free-vector/contact-us-concept-illustration_114360-2299.jpg"
            alt="Contact Illustration"
          />
        </div>
      </div>
    </div>  
      </section>
    </>
  );
};
export default Home;
