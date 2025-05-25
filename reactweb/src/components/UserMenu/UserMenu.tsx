import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./UserMenu.css";
import { useLanguage } from "../../context/LanguageContext";

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
  isGym?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout, isGym }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(0);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const count = Number(localStorage.getItem("pendingInvitations") || 0);
    setPending(count);
    console.log("[UserMenu] Contador de invitaciones pendientes:", count);
    window.addEventListener("storage", () => {
      setPending(Number(localStorage.getItem("pendingInvitations") || 0));
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <span className="user-name" onClick={toggleMenu}>
        {userName}
        {pending > 0 && <span className="badge">{pending}</span>}
      </span>
      {isOpen && (
        <div className="dropdown">
          {isGym ? (
            // Gym user menu
            <>
              <Link to="/gym-profile" className="dropdown-item">
                {t("gymProfile")}
              </Link>
              <button
                className="dropdown-item logout-button"
                onClick={onLogout}
              >
                {t("logout")}
              </button>
            </>
          ) : (
            // Regular user menu
            <>
              <Link to="/profile" className="dropdown-item">
                {t("profile")}
              </Link>
              <Link to="/combates" className="dropdown-item">
                {t("myCombats")}
                {pending > 0 && <span className="badge">{pending}</span>}
              </Link>
              <Link to="/estadisticas" className="dropdown-item">
                {t("statistics")}
              </Link>
              <button
                className="dropdown-item logout-button"
                onClick={onLogout}
              >
                {t("logout")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
