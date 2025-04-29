import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "../UserMenu/UserMenu";
import { logout } from "../../services/authService";

interface HeaderProps {
  user: { name: string } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Face2Face
      </Link>
      <nav className="nav">
        <Link to="/events" className="nav-link">
          Eventos
        </Link>
        {user ? (
          <UserMenu userName={user.name} onLogout={onLogout} />
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">
              Inicia sesión
            </Link>
            <Link to="/register" className="nav-link">
              Regístrate
            </Link>
            <Link to="/gym-toggle" className="gym-button">
              Eres un gimnasio
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
