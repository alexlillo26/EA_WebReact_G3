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
        const { combats, totalPages } = await getCombats({ page: currentPage });
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
          <li key={combat._id}>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Fecha:</span>
              <span className="combat-detail-value">{combat.date instanceof Date ? combat.date.toLocaleString() : String(combat.date)}</span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Hora:</span>
              <span className="combat-detail-value">{combat.time || '-'}</span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Boxeadores:</span>
              <span className="combat-detail-value">
                {Array.isArray((combat as any).boxers) && (combat as any).boxers.length > 0 ?
                  (combat as any).boxers.map((boxer: any) =>
                    typeof boxer === 'string' ? boxer : (boxer.name || boxer._id || '-')
                  ).join(' vs ') : '-'}
              </span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Gimnasio:</span>
              <span className="combat-detail-value">
                {typeof (combat as any).gym === 'object' && (combat as any).gym !== null
                  ? ((combat as any).gym.name || (combat as any).gym._id)
                  : (combat as any).gym}
              </span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Nivel:</span>
              <span className="combat-detail-value">{combat.level || '-'}</span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">Visible:</span>
              <span className="combat-detail-value">{(combat as any).isHidden ? 'No' : 'Sí'}</span>
            </div>
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
