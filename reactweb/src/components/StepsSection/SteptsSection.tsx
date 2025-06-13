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

const StepsSectionGym: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="steps-section">
      <h2 className="steps-title">{t("gymSteps.title")}</h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>{t("gymSteps.step1Title")}</h3>
          <p>{t("gymSteps.step1Desc")}</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>{t("gymSteps.step2Title")}</h3>
          <p>{t("gymSteps.step2Desc")}</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>{t("gymSteps.step3Title")}</h3>
          <p>{t("gymSteps.step3Desc")}</p>
        </div>
      </div>
    </section>
  );
};

export { StepsSection, StepsSectionGym };
