import React, {  useEffect } from "react";
import "../css/aboutUs.css";
import { useLanguage } from "../context/LanguageContext";

const AboutUs = () => {
  const { lang, t } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div className="about-body" >
      {/* ===== Hero Section ===== */}
      <header className="about-hero">
        <div className="overlay">
          <h1 className="fade-in">{t("hero_title")}</h1>
          <p className="fade-in">{t("hero_subtitle")}</p>
        </div>
      </header>
          {/* ===== Who We Are ===== */}
          <section className="about-section fade-in-up">
            <h2>{t("who_title")}</h2>
            <p>{t("who_text")}</p>
          </section>

          {/* ===== Mission ===== */}
          <section className="about-section mission fade-in-up">
            <h2>{t("mission_title")}</h2>
            <p>{t("mission_text")}</p>
          </section>

          {/* ===== Vision ===== */}
          <section className="about-section vision fade-in-up">
            <h2>{t("vision_title")}</h2>
            <p>{t("vision_text")}</p>
          </section>

          {/* ===== Team ===== */}
          <section className="about-team fade-in-up">
            <h2>{t("team_title")}</h2>
            <div className="team-grid">
                <div className="team-member" >
                  <img
                    src={`https://cdn-icons-png.flaticon.com/512/4140/4140048.png`}
                    alt={t("team_members_first_name") }
                  />
                  <h3>{t("team_members_first_name") }</h3>
                  <p>{t("team_members_first_role") }</p>
                </div>
              
                <div className="team-member" >
                  <img
                    src={`https://cdn-icons-png.flaticon.com/512/4140/4140050.png`}
                    alt={t("team_members_second_name") }
                  />
                  <h3>{t("team_members_second_name") }</h3>
                  <p>{t("team_members_second_role") }</p>
                </div>
            </div>
          </section>
    </div>
  );
};

export default AboutUs;