import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../../services/userService'; // Importar el servicio
import './login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Limpiar mensajes de error previos

    try {
      const user = await loginUser(email, password);

      if (user) {
        alert('Login exitoso');
        console.log(user);
      } else {
        setErrorMessage('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      setErrorMessage('Ocurrió un error al iniciar sesión. Por favor, inténtalo más tarde.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <input
          type="email"
          placeholder="Correo Electrónico"
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
        <button type="submit">Ingresar</button>
      </form>
      <p>
        ¿No tienes cuenta?{' '}
        <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;