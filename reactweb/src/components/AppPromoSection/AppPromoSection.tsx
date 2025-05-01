import React from 'react';
import './AppPromoSection.css';
import appMockup from '../../assets/app-mockup.png'; // Imagen de maqueta del móvil
import appStoreBadge from '../../assets/app-store-badge.png'; // Botón App Store
import googlePlayBadge from '../../assets/google-play-badge.png'; // Botón Google Play

const AppPromoSection: React.FC = () => {
  return (
    <section className="app-promo-section">
      <div className="app-promo-container">
        {/* Maqueta del móvil */}
        <div className="app-mockup">
          <img src={appMockup} alt="App Mockup" />
        </div>

        {/* Contenido promocional */}
        <div className="app-promo-content">
          <h2 className="app-promo-title">¡Descarga nuestra App!</h2>
          <p className="app-promo-testimonial">
            ★★★★★ <br />
            "La mejor app para boxeadores. Me ayudó a encontrar rivales y mejorar mi ranking."
          </p>
          <ul className="app-benefits">
            <li>🔍 Buscar combates cercanos.</li>
            <li>🤝 Conectar con rivales, entrenadores y promotores.</li>
            <li>📊 Estadísticas de combates.</li>
            <li>🏟️ Reservas de rings o entrenamientos.</li>
            <li>🔒 Seguridad de datos y sistema de ranking.</li>
            <li>📸 Compartir resultados y fotos de peleas.</li>
          </ul>
          <div className="app-download-buttons">
            <a
              href="https://apps.apple.com/" // Reemplaza con el enlace real de tu app en App Store
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStoreBadge} alt="Descargar en App Store" />
            </a>
            <a
              href="https://play.google.com/store" // Reemplaza con el enlace real de tu app en Google Play
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

export default AppPromoSection;