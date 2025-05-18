import React from 'react';
import { Link } from 'react-router-dom';
import './GymDashboard.css'; // Import your CSS file for styling

const GymDashboard: React.FC = () => {
    return (
        <div>
            <h1>Panel del Gimnasio</h1>
            <div>
                <h2>Categorías</h2>
                <ul>
                    <li>
                        <Link to="/gym/edit-profile">Editar Perfil</Link>
                    </li>
                    <li>
                        <Link to="/gym/pending-combats">Combates Pendientes</Link>
                    </li>
                    <li>
                        <Link to="/gym/calendar">Calendario de Combates</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GymDashboard;