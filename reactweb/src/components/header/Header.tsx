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
        <Link to="/events" className="nav-link">Eventos</Link>
        {user ? (
          <div className="user-menu">
            <span className="nav-link user-name">{user.name}</span>
            <div className="dropdown">
              <Link to="/profile" className="dropdown-item">Mi Perfil</Link>
              <button className="dropdown-item" onClick={onLogout}>Cerrar Sesión</button>
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
  );
};

export default Header;