import React, { useEffect, useState } from 'react';
import { getGyms } from '../../services/gymService';
import { Gym } from '../../models/Gym';
import './GymList.css';

const GymList: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { gyms, totalPages } = await getGyms(currentPage);
        setGyms(gyms);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error al obtener los gimnasios:', error);
      }
    };
    fetchGyms();
  }, [currentPage]);

  return (
    <div className="gym-list">
      <h2>Lista de Gimnasios</h2>
      <ul>
        {gyms.map((gym) => (
          <li key={gym.id}>
            <strong>{gym.name}</strong> - {gym.place} (${gym.price})
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default GymList;