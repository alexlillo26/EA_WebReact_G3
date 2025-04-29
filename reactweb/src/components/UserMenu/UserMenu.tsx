import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./UserMenu.css";

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="user-menu">
      <span className="user-name" onClick={toggleMenu}>
        {userName}
      </span>
      {isOpen && (
        <div className="dropdown">
          <Link to="/profile" className="dropdown-item">
            Perfil
          </Link>
          <Link to="/combates" className="dropdown-item">
            Mis Combates
          </Link>
          <Link to="/estadisticas" className="dropdown-item">
            Estadísticas
          </Link>
          <button className="dropdown-item logout-button" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;