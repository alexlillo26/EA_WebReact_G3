import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  user: { name: string } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {

  return (
    <header className="header">
      <div className="logo">Face2Face</div>
      <nav className="nav">
        <Link to="/" className="nav-link">Inicio</Link>
        {!user ? (
          <>
            <Link to="/login" className="nav-link">Inicia sesión</Link>
            <Link to="/register" className="nav-link">Regístrate</Link>
            <Link to="/gym-registration" className="gym-button">Eres un gimnasio</Link>
          </>
        ) : (
          <div className="user-menu">
            <span className="welcome-message"> Bienvenido, {user?.name || "usuario"}</span>
            <button className="logout-button" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;