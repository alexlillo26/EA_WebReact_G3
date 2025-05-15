import React, { useEffect, useState } from "react";
import { getCombats } from "../../services/combatService";
import { Combat } from "../../models/Combat";
import "./CombatList.css";

const CombatList: React.FC = () => {
  const [combats, setCombats] = useState<Combat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCombats = async () => {
      try {
        const { combats, totalPages } = await getCombats(currentPage);
        setCombats(combats);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error al obtener los combates:", error);
      }
    };
    fetchCombats();
  }, [currentPage]);

  return (
    <div className="combat-list">
      <h2>Lista de Combates</h2>
      <ul>
        {combats.map((combat) => (
          <li key={combat.id}>
            <strong>Fecha:</strong>{" "}
            {combat.date instanceof Date
              ? combat.date.toLocaleDateString()
              : combat.date}{" "}
            <br />
            <strong>Gimnasio:</strong> {combat.gym} <br />
            <strong>Boxeadores:</strong> {combat.boxers.join(", ")}
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default CombatList;
