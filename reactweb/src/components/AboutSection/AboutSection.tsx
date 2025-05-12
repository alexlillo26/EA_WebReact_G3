import React from "react";
import "./AboutSection.css";
import logo from "../../assets/logo.png"; // Asegúrate de que el logo esté en esta ruta
import { useLanguage } from "../../context/LanguageContext";

const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2 className="about-title">{t("aboutTitle")}</h2>
          <p>{t("aboutDescription")}</p>
        </div>
        <div className="about-logo">
          <img src={logo} alt="Face2Face Logo" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
