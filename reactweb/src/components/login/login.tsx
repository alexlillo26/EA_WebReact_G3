import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getToken } from '../../services/authService'; // Added getToken import
import './login.css';

const Login: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      console.log("Attempting login with email:", email);
      await login(email, password);
      const token = getToken();
      console.log("Token after login:", token);
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log("Decoded token payload:", decoded);
        const userData = { id: decoded.id, name: decoded.name || "Usuario" };
        onLogin(userData.name); // Update user state
        localStorage.setItem("userData", JSON.stringify(userData));
        navigate('/'); // Redirect to home
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:9000/api/auth/google?origin=webreact';
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        {errorMessage && <p style={{ color: '#ff4d4d', marginBottom: '15px' }}>{errorMessage}</p>}
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
      <button onClick={handleGoogleLogin} className="google-login-button">
        Iniciar sesión con Google
      </button>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;