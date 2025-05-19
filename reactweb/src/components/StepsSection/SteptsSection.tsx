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
  return (
    <section className="steps-section">
      <h2 className="steps-title">
        Con Face2Face tu gimnasio crece así de fácil
      </h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Publica tus eventos</h3>
          <p>
            Promociona tus torneos, clases o actividades y llega a más
            boxeadores de tu zona.
          </p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Gestiona inscripciones</h3>
          <p>
            Recibe y organiza inscripciones de participantes de forma sencilla y
            centralizada.
          </p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Analiza tu impacto</h3>
          <p>
            Consulta estadísticas de asistencia, combates y mejora la
            visibilidad de tu gimnasio.
          </p>
        </div>
      </div>
    </section>
  );
};

export { StepsSection, StepsSectionGym };
