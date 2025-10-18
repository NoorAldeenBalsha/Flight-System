import React, {  useEffect } from "react";
import "../css/aboutUs.css";
import { useLanguage } from "../context/LanguageContext";

const AboutUs = () => {
  const { lang, t } = useLanguage();

  // تغيير اتجاه الصفحة بناءً على اللغة
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div >
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
          {t("team_members")?.map((member, index) => (
            <div className="team-member" key={index}>
              <img
                src={`https://cdn-icons-png.flaticon.com/512/4140/41400${48 + index}.png`}
                alt={member.name}
              />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
};

export default AboutUs;