import React, { useEffect, useState } from "react";
import { getCombats } from "../../services/combatService";
import { Combat } from "../../models/Combat";
import "./CombatList.css";
import { useLanguage } from "../../context/LanguageContext";

const CombatList: React.FC = () => {
  const { t } = useLanguage();
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
      <h2>{t("combatList.title")}</h2>
      <ul>
        {combats.map((combat) => (
          <li key={combat._id}>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.date")}:
              </span>
              <span className="combat-detail-value">
                {combat.date instanceof Date
                  ? combat.date.toLocaleString()
                  : String(combat.date)}
              </span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.time")}:
              </span>
              <span className="combat-detail-value">{combat.time || "-"}</span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.boxers")}:
              </span>
              <span className="combat-detail-value">
                {Array.isArray((combat as any).boxers) &&
                (combat as any).boxers.length > 0
                  ? (combat as any).boxers
                      .map((boxer: any) =>
                        typeof boxer === "string"
                          ? boxer
                          : boxer.name || boxer._id || "-"
                      )
                      .join(" vs ")
                  : "-"}
              </span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.gym")}:
              </span>
              <span className="combat-detail-value">
                {typeof (combat as any).gym === "object" &&
                (combat as any).gym !== null
                  ? (combat as any).gym.name || (combat as any).gym._id
                  : (combat as any).gym}
              </span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.level")}:
              </span>
              <span className="combat-detail-value">{combat.level || "-"}</span>
            </div>
            <div className="combat-detail-row">
              <span className="combat-detail-label">
                {t("combatList.visible")}:
              </span>
              <span className="combat-detail-value">
                {(combat as any).isHidden
                  ? t("combatList.no")
                  : t("combatList.yes")}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          {t("combatList.previous")}
        </button>
        <span>
          {t("combatList.page")} {currentPage} {t("combatList.of")} {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          {t("combatList.next")}
        </button>
      </div>
    </div>
  );
};

export default CombatList;
