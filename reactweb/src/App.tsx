import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register';
import './App.css';

function App() {
  const [user, setUser] = useState<{ name: string } | null>(null); // Estado para el usuario logueado

  return (
    <Router>
      <div className="landing-page">
        {/* Header */}
        <header className="header">
          <div className="logo">Face2Face</div>
          <nav className="nav">
            <Link to="/events" className="nav-link">Eventos</Link>
            {user ? (
              <div className="user-menu">
                <span className="nav-link user-name">{user.name}</span>
                <div className="dropdown">
                  <Link to="/profile" className="dropdown-item">Mis Datos</Link>
                  <button className="dropdown-item" onClick={() => setUser(null)}>Cerrar Sesión</button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link">Inicia sesión / Regístrate</Link>
                <Link to="/gyms" className="gym-button">¿Eres un gimnasio?</Link>
              </>
            )}
          </nav>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={(name) => setUser({ name })} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home: React.FC = () => (
  <section className="hero">
    <div className="hero-content">
      <h1>Organiza y encuentra combates de Boxeo al instante</h1>
      <p>
        Conecta con rivales, promotores y gimnasios. Participa en peleas equilibradas, 
        entrena con los mejores y escala en el ranking.
      </p>
      <form className="search-form">
        <input type="text" placeholder="Ciudad, gimnasio o boxeador" />
        <select>
          <option value="amateur">Amateur</option>
          <option value="profesional">Profesional</option>
          <option value="sparring">Sparring</option>
        </select>
        <input type="date" />
        <select>
          <option value="peso-pluma">Peso pluma</option>
          <option value="peso-medio">Peso medio</option>
          <option value="peso-pesado">Peso pesado</option>
        </select>
        <button type="submit" className="search-button">Buscar Combate</button>
      </form>
    </div>
  </section>
);

const Profile: React.FC<{ user: { name: string } | null }> = ({ user }) => (
  <div className="profile-container">
    <h2>Mis Datos</h2>
    {user ? (
      <p>Nombre: {user.name}</p>
    ) : (
      <p>No has iniciado sesión.</p>
    )}
  </div>
);

export default App;