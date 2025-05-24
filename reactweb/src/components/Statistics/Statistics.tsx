import React, { useEffect, useState } from "react";
import { getCombatsByBoxer } from "../../services/statisticsService";
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
    console.log(
      "useEffect triggered with boxerId:",
      boxerId,
      "and currentPage:",
      currentPage
    ); // Log para verificar cuándo se ejecuta el useEffect

    const fetchCombats = async () => {
      console.log(
        "Fetching combats for boxer:",
        boxerId,
        "on page:",
        currentPage
      ); // Log para verificar el ID del boxeador y la página actual
      try {
        setLoading(true);
        const combatsData = await getCombatsByBoxer(boxerId);
        setCombats(combatsData.combats);
        setTotalPages(1); // Solo 1 página
      } catch (err) {
        console.error(t("errorLoadingCombats"), err); // Log para capturar errores
        // EL ERROR SALTA AQUÍ
        setError(t("errorLoadingCombats"));
      } finally {
        setLoading(false);
        console.log("Finished fetching combats"); // Log para indicar que la solicitud ha terminado
      }
    };

    fetchCombats();
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
