import React, { useState } from 'react';
import { registerUser } from '../../services/userService';
import { handleGoogleOAuth } from '../../services/authService';
import './register.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const user = await registerUser({
        name,
        birthDate: new Date(birthDate),
        email,
        password
      });

      if (user) {
        alert('Registro exitoso');
      } else {
        setErrorMessage('No se pudo completar el registro. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      setErrorMessage('Ocurrió un error al registrar el usuario. Por favor, inténtalo más tarde.');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const googleCode = new URLSearchParams(window.location.search).get("code");
      if (googleCode) {
        const userData = await handleGoogleOAuth(googleCode);
        alert(`Registro exitoso. Bienvenido, ${userData.name}`);
      } else {
        window.location.href = 'http://localhost:9000/api/auth/google?origin=webreact';
      }
    } catch (error) {
      console.error("Error en el registro con Google:", error);
      alert("Error al registrar con Google. Por favor, inténtalo más tarde.");
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {errorMessage && <p style={{ color: '#ff4d4d', marginBottom: '15px' }}>{errorMessage}</p>}
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Fecha de nacimiento"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      <button onClick={handleGoogleRegister} className="google-register-button">
        Registrarse con Google
      </button>
    </div>
  );
};

export default Register;
