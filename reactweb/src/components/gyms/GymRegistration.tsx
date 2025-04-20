import React, { useState } from 'react';
import { registerGym } from '../../services/gymService';
import { Gym } from '../../models/Gym';
import './GymRegistration.css';

const GymRegistration: React.FC = () => {
  const [gymData, setGymData] = useState<Gym>({
    name: '',
    email: '',
    phone: '',
    place: '',
    price: 0,
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGymData({ ...gymData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerGym(gymData);
      alert('Gimnasio registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar el gimnasio:', error);
      alert('Error al registrar el gimnasio');
    }
  };

  return (
    <div className="gym-registration-container">
      <h1>Registro de Gimnasio</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nombre:</label>
        <input type="text" id="name" name="name" value={gymData.name} onChange={handleChange} required />

        <label htmlFor="email">Correo Electrónico:</label>
        <input type="email" id="email" name="email" value={gymData.email} onChange={handleChange} required />

        <label htmlFor="phone">Teléfono:</label>
        <input type="text" id="phone" name="phone" value={gymData.phone} onChange={handleChange} required />

        <label htmlFor="place">Ubicación:</label>
        <input type="text" id="place" name="place" value={gymData.place} onChange={handleChange} required />

        <label htmlFor="price">Precio:</label>
        <input type="number" id="price" name="price" value={gymData.price} onChange={handleChange} required />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" value={gymData.password} onChange={handleChange} required />

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default GymRegistration;