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
          <h2 className="app-promo-title">{t("appPromoGymTitle")}</h2>
          <p className="app-promo-testimonial">{t("appPromoGymTestimonial")}</p>
          <ul className="app-benefits">
            <li>{t("appPromoGymBenefit1")}</li>
            <li>{t("appPromoGymBenefit2")}</li>
            <li>{t("appPromoGymBenefit3")}</li>
            <li>{t("appPromoGymBenefit4")}</li>
            <li>{t("appPromoGymBenefit5")}</li>
            <li>{t("appPromoGymBenefit6")}</li>
          </ul>
          <div className="app-download-buttons">
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStoreBadge} alt={t("appStoreAlt")} />
            </a>
            <a
              href="https://play.google.com/store"
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

export { AppPromoSectionGym, AppPromoSection };
