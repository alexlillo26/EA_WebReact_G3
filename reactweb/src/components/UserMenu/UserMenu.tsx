import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./UserMenu.css";
import { useLanguage } from "../../context/LanguageContext";

interface UserMenuProps {
  userName: string; // Ensure this prop is passed correctly
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false); // Close the menu if the click is outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <span className="user-name" onClick={toggleMenu}>
        {userName} {/* Display the correct user name */}
      </span>
      {isOpen && (
        <div className="dropdown">
          <Link to="/profile" className="dropdown-item">
            {t("profile")}
          </Link>
          <Link to="/combates" className="dropdown-item">
            {t("myCombats")}
          </Link>
          <Link to="/estadisticas" className="dropdown-item">
            {t("statistics")}
          </Link>
          <button className="dropdown-item logout-button" onClick={onLogout}>
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
