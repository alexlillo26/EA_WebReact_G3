import React from 'react';
import './AboutSection.css';
import logo from '../../assets/logo.png'; // Asegúrate de que el logo esté en esta ruta

const AboutSection: React.FC = () => {
  return (
    <section className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2 className="about-title">¿Qué es Face2Face?</h2>
          <p>
            Face2Face es una plataforma diseñada para conectar boxeadores, promotores y gimnasios en un solo lugar. 
            Nuestro objetivo es facilitar la organización de combates, encontrar rivales de nivel similar y ayudar 
            a los boxeadores a mejorar su ranking. Ya seas un principiante o un profesional, Face2Face te ofrece 
            las herramientas necesarias para llevar tu carrera al siguiente nivel. Únete a nuestra comunidad y 
            experimenta una forma más sencilla y eficiente de competir y crecer en el mundo del boxeo.
          </p>
        </div>
        <div className="about-logo">
          <img src={logo} alt="Face2Face Logo" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;