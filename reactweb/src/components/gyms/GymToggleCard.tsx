import React, { useState } from "react";
import styled from "styled-components";
import GymLogin from "./GymLogin";
import GymRegistration from "./GymRegistration";

const GymToggleCard: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleToggle = () => {
    setIsFlipped(!isFlipped);
    console.log(
      isFlipped ? "Girando para iniciar sesión" : "Girando para registrarse"
    );
  };

  return (
    <StyledWrapper>
      <div className="card-container">
        <button className="toggle-btn" onClick={handleToggle}>
          {isFlipped ? "Ir a Iniciar Sesión" : "Ir a Registro"}
        </button>
        <div className={`flip-card__inner ${isFlipped ? "flipped" : ""}`}>
          <div className="flip-card__front">
            <GymLogin />
          </div>
          <div className="flip-card__back">
            <GymRegistration />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  .card-container {
    position: relative;
    width: 400px;
    height: 10px;
    perspective: 1000px; /* Necesario para el efecto 3D */
  }

  .flip-card__inner {
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    position: relative;
  }

  .flip-card__inner.flipped {
    transform: rotateY(180deg);
  }

  .flip-card__front,
  .flip-card__back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    top: 0;
    left: 0;
    background-color: rgba(
      26,
      26,
      26,
      0.9
    ); /* Fondo oscuro con transparencia */
    color: white; /* Color del texto */
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px; /* Bordes redondeados */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra para destacar */
  }

  .flip-card__back {
    transform: rotateY(180deg);
  }

  .flip-card__front {
    z-index: 2;
  }

  .flip-card__back {
    z-index: 1;
  }

  .toggle-btn {
    position: absolute;
    top: -200px; /* Mueve el botón hacia arriba */
    left: 50%;
    transform: translateX(-50%); /* Centra el botón horizontalmente */
    background-color: #d62828;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 200px; /* Ajusta el ancho del botón */
    height: 40px;
  }

  .toggle-btn:hover {
    background-color: #a31f1f;
  }
`;

export default GymToggleCard;
