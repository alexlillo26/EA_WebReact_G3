import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/userService';
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
      const user = await loginUser(email, password);

      if (user) {
        onLogin(user.name); // Pasar el nombre del usuario al componente principal
        navigate('/'); // Redirigir a la página principal
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
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;