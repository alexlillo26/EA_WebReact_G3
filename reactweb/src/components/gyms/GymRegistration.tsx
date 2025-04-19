import React from 'react';
import './GymRegistration.css';

const GymRegistration: React.FC = () => {
  return (
    <div className="gym-registration-container">
      <h1>Registro de Gimnasio</h1>
      <form>
        <label htmlFor="gym-name">Nombre del Gimnasio:</label>
        <input type="text" id="gym-name" placeholder="Introduce el nombre del gimnasio" />

        <label htmlFor="owner-name">Nombre del Propietario:</label>
        <input type="text" id="owner-name" placeholder="Introduce el nombre del propietario" />

        <label htmlFor="email">Correo Electrónico:</label>
        <input type="email" id="email" placeholder="Introduce el correo electrónico" />

        <label htmlFor="phone">Teléfono:</label>
        <input type="tel" id="phone" placeholder="Introduce el teléfono" />

        <label htmlFor="address">Dirección:</label>
        <input type="text" id="address" placeholder="Introduce la dirección" />

        <button type="submit">Registrar</button>
      </form>
      <p>Nos pondremos en contacto contigo tras el registro.</p>
    </div>
  );
};

export default GymRegistration;