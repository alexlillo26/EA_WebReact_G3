import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../UserMenu/UserMenu';

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
          <UserMenu userName={user.name} onLogout={onLogout} />
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