import React, { useEffect, useState } from "react";
import { getGymCombats } from "../../services/combatService";
import { Combat } from "../../models/Combat";
import { useLanguage } from "../../context/LanguageContext";
import "./CombatHistory.css";

const GymCombatHistory: React.FC = () => {
  const { t } = useLanguage();
  const [combats, setCombats] = useState<Combat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get current gymId
  const gymId = (() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id;
      }
    } catch (e) { /* intentionally empty */ }
    return null;
  })();

  useEffect(() => {
    if (!gymId) return;
    setIsLoading(true);
    setError(null);
    getGymCombats(gymId)
      .then((res) => {
        setCombats(res.combats || []);
      })
      .catch(() => setError(t("combatHistory.errorLoading")))
      .finally(() => setIsLoading(false));
  }, [gymId, t]);

  if (!gymId) {
    return <p style={{color:'red'}}>No gymId found in userData</p>;
  }
  if (isLoading) {
    return <p>{t("combatHistory.loading")}</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // Group by date
  const today = new Date();
  today.setHours(0,0,0,0);
  const futuros = combats.filter(c => {
    const d = new Date(c.date as string);
    d.setHours(0,0,0,0);
    return d >= today && ["accepted","active","pending"].includes(c.status);
  });
  const historicos = combats.filter(c => {
    const d = new Date(c.date as string);
    d.setHours(0,0,0,0);
    return d < today && c.status === "completed";
  });

  const getEstadoLabel = (combat: Combat) => {
    if ((combat as any).result) {
      return t(`combatHistory.result.${(combat as any).result.toLowerCase()}`) || (combat as any).result;
    }
    return t(`combatStatus.${combat.status}`) || combat.status;
  };

  const renderCard = (combat: Combat) => {
    const creatorName = (combat as any).creator?.username || (combat as any).creator?.name || (combat as any).creator || "N/A";
    const opponentName = (combat as any).opponent?.username || (combat as any).opponent?.name || (combat as any).opponent || "N/A";
    const vsTitle = `${creatorName} vs ${opponentName}`;
    return (
      <li key={combat._id} className="combat-history-item custom-combat-card">
        <div className="combat-card-icon">
          <span role="img" aria-label="boxing-glove">🥊</span>
        </div>
        <div className="combat-card-content">
          <div className="combat-card-title">{vsTitle}</div>
          {(combat as any).level && (
            <div className="combat-card-row">
              <strong>{t("combatHistory.level")}:</strong> {(combat as any).level}
            </div>
          )}
          <div className="combat-card-row">
            <strong>{t("combatHistory.date")}:</strong> {new Date(combat.date as string).toLocaleDateString()} {(combat as any).time && `- ${(combat as any).time}`}
          </div>
          <div className="combat-card-row">
            <strong>Estado:</strong> {getEstadoLabel(combat)}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="combat-history-container">
      <h3>Próximos combates</h3>
      {futuros.length === 0 ? (
        <p style={{ color: '#e50914' }}>{t('noFutureCombats') || 'No hay combates futuros'}</p>
      ) : (
        <ul>{futuros.map(renderCard)}</ul>
      )}
      <h3>{t("combatHistory.title")}</h3>
      {historicos.length === 0 ? (
        <p>{t("combatHistory.noCombats")}</p>
      ) : (
        <ul>{historicos.map(renderCard)}</ul>
      )}
    </div>
  );
};

export default GymCombatHistory; 