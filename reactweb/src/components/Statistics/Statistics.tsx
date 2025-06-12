import React, { useEffect, useState } from "react";
// import { getCombatsByBoxer } from "../../services/statisticsService"; // <-- Elimina o comenta esta línea
import { Combat } from "../../models/Combat";
import { useLanguage } from "../../context/LanguageContext"; // Importa el contexto de idioma

interface StatisticsProps {
  boxerId: string; // ID del boxeador que ha iniciado sesión
}

const Statistics: React.FC<StatisticsProps> = ({ boxerId }) => {
  const { t } = useLanguage();
  const [combats, setCombats] = useState<Combat[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError("Funcionalidad deshabilitada: getCombatsByBoxer no está disponible.");
    setLoading(false);
    // Si tienes una función alternativa, úsala aquí.
    // Ejemplo:
    // fetchUserStatistics(boxerId).then(...);
  }, [boxerId, currentPage]);

  if (loading) {
    console.log("Loading state is true"); // Log para verificar el estado de carga
    return <p>{t("loadingCombats")}</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>{t("statisticsTitle")}</h2>
      <h3>{t("combatListTitle")}</h3>
      {combats.length > 0 ? (
        <ul>
          {combats.map((combat) => (
            <li key={combat._id}>
              <strong>{t("dateLabel")}:</strong>{" "}
              {new Date(combat.date as string).toLocaleDateString()} <br />
              <strong>{t("gymLabel")}:</strong>{" "}
              {(combat as any).gym && typeof (combat as any).gym === "object"
                ? (combat as any).gym.name
                : typeof (combat as any).gym === "string"
                ? (combat as any).gym
                : "-"}
              <br />
              <strong>{t("boxersLabel")}:</strong>{" "}
              {Array.isArray((combat as any).boxers) && (combat as any).boxers.length > 0
                ? (combat as any).boxers
                    .map((boxer: any) =>
                      typeof boxer === "string"
                        ? boxer
                        : boxer.name || boxer._id || "-"
                    )
                    .join(", ")
                : "-"}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("noCombatsAvailable")}</p>
      )}
      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          {t("previousButton")}
        </button>
        <span>
          {t("pageLabel")} {currentPage} {t("ofLabel")} {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          {t("nextButton")}
        </button>
      </div>
    </div>
  );
};

export default Statistics;
