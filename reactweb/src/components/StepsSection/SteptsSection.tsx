import React from "react";
import "./StepsSection.css";
import { useLanguage } from "../../context/LanguageContext";

const StepsSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="steps-section">
      <h2 className="steps-title">{t("stepsTitle")}</h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>{t("step1Title")}</h3>
          <p>{t("step1Description")}</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>{t("step2Title")}</h3>
          <p>{t("step2Description")}</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>{t("step3Title")}</h3>
          <p>{t("step3Description")}</p>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
