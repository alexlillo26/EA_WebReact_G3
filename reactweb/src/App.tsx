import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/login/login';
import Register from './components/register/register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Face2Face</h1>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="nav-link">Registrarse</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2025 Face2Face. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

const Home: React.FC = () => (
  <div className="home-container">
    <h2>Bienvenido a Face2Face</h2>
    <p>
     Inicia tu sesión o regístrate y forma parte de nuestra comunidad de campeones !
    </p>
    <div className="home-actions">
      <Link to="/login" className="action-button">Iniciar Sesión</Link>
      <Link to="/register" className="action-button">Registrarse</Link>
    </div>
  </div>
);

export default App;