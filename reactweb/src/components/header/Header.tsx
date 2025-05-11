import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "../UserMenu/UserMenu";
import { useLanguage } from "../../context/LanguageContext";

interface HeaderProps {
  user: { name: string } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { t } = useLanguage();
  return (
    <header className="header">
      <Link to="/" className="logo">
        Face2Face
      </Link>
      <nav className="nav">
        <Link to="/events" className="nav-link">
          {t("events")}
        </Link>
        {user ? (
          <UserMenu userName={user.name} onLogout={onLogout} />
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">
              {t("login")}
            </Link>
            <Link to="/register" className="nav-link">
              {t("register")}
            </Link>
            <Link to="/gym-toggle" className="gym-button">
              {t("gymButton")}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
