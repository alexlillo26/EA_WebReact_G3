import React from 'react';
import './StepsSection.css';

const StepsSection: React.FC = () => {
  return (
    <section className="steps-section">
      <h2 className="steps-title">Con Face2Face es así de sencillo</h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>Encuentra Rival</h3>
          <p>Conecta con boxeadores de nivel similar y organiza combates emocionantes.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Organiza Combates</h3>
          <p>Programa peleas en gimnasios cercanos y lleva tu entrenamiento al siguiente nivel.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Mejora tu Ranking</h3>
          <p>Compite, gana y sube de nivel para convertirte en el mejor.</p>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;