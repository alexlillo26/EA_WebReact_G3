import React from "react";
import "./AppPromoSection.css";
import appMockup from "../../assets/app-mockup.png"; // Imagen de maqueta del móvil
import appStoreBadge from "../../assets/app-store-badge.png"; // Botón App Store
import googlePlayBadge from "../../assets/google-play-badge.png"; // Botón Google Play
import { useLanguage } from "../../context/LanguageContext"; // Importa el contexto de idioma

const AppPromoSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="app-promo-section">
      <div className="app-promo-container">
        {/* Maqueta del móvil */}
        <div className="app-mockup">
          <img src={appMockup} alt="App Mockup" />
        </div>

        {/* Contenido promocional */}
        <div className="app-promo-content">
          <h2 className="app-promo-title">{t("appPromoTitle")}</h2>
          <p className="app-promo-testimonial">{t("appPromoTestimonial")}</p>
          <ul className="app-benefits">
            <li>{t("appBenefit1")}</li>
            <li>{t("appBenefit2")}</li>
            <li>{t("appBenefit3")}</li>
            <li>{t("appBenefit4")}</li>
            <li>{t("appBenefit5")}</li>
            <li>{t("appBenefit6")}</li>
          </ul>
          <div className="app-download-buttons">
            <a
              href="https://apps.apple.com/" // Reemplaza con el enlace real de tu app en App Store
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStoreBadge} alt={t("appStoreAlt")} />
            </a>
            <a
              href="https://play.google.com/store" // Reemplaza con el enlace real de tu app en Google Play
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={googlePlayBadge} alt={t("googlePlayAlt")} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const AppPromoSectionGym: React.FC = () => {
  return (
    <section className="app-promo-section">
      <div className="app-promo-container">
        {/* Maqueta del móvil */}
        <div className="app-mockup">
          <img src={appMockup} alt="App Mockup" />
        </div>

        {/* Contenido promocional */}
        <div className="app-promo-content">
          <h2 className="app-promo-title">¡Gestiona tu gimnasio con nuestra App!</h2>
          <p className="app-promo-testimonial">
            ★★★★★ 'La mejor app para gimnasios. Ahora puedo gestionar inscripciones y eventos fácilmente.'
          </p>
          <ul className="app-benefits">
            <li>📢 Promociona tus eventos y actividades.</li>
            <li>📝 Gestiona inscripciones de participantes.</li>
            <li>📊 Controla la asistencia y estadísticas de tu gimnasio.</li>
            <li>📅 Reserva rings y horarios de entrenamiento.</li>
            <li>🔒 Seguridad de datos y gestión centralizada.</li>
            <li>🚀 Más visibilidad para tu gimnasio en la comunidad.</li>
          </ul>
          <div className="app-download-buttons">
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStoreBadge} alt="Descargar en App Store" />
            </a>
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={googlePlayBadge} alt="Descargar en Google Play" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPromoSectionGym;
