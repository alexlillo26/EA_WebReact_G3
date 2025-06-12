import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { fetchCombatHistory } from "../../services/combatService"; // Importamos el servicio de combates
import { Rating } from "../../models/Rating";
import { CombatHistoryEntry } from "../../models/Combat"; // Importamos el tipo de dato
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  open: boolean;
  onClose: () => void;
  user: any;
  currentUserCity?: string;
}

const SeeProfile: React.FC<Props> = ({
  open,
  onClose,
  user,
  currentUserCity,
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  // CAMBIO: Nuevo estado para guardar el historial
  const [history, setHistory] = useState<CombatHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      // Pedimos los datos de valoraciones e historial en paralelo
      Promise.all([
        getRatingsByUser(userId),
        fetchCombatHistory(userId, 1, 3) // Pedimos solo la página 1 con 3 resultados
      ]).then(([ratingsResponse, historyResponse]) => {
        setRatings(Array.isArray(ratingsResponse) ? ratingsResponse : []);
        setHistory(historyResponse.combats);
      }).catch(err => {
        console.error("Error fetching profile data:", err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [open, userId]);

  if (!open || !user) return null;

  const avgField = (field: keyof Rating) =>
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + Number(r[field] ?? 0), 0) /
          ratings.length
        ).toFixed(1) // Usamos 1 decimal para un look más limpio
      : "-";

  return (
    <UserProfileModal open={open} onClose={onClose}>
      {/* Usamos el CSS del modal para los estilos */}
      <div className="see-profile-content">
        <div className="profile-header">
            <img src={user.profilePicture || '/default-avatar.png'} alt={user.name} className="profile-avatar" />
            <div className="profile-header-info">
                <h2>{user.name}</h2>
                <p>{user.city}</p>
            </div>
        </div>
        
        <div className="profile-stats-grid">
            <div className="stat-item"><span>Peso</span><b>{user.weight}</b></div>
            <div className="stat-item"><span>Email</span><b>{user.email}</b></div>
        </div>

        <hr />
        
        <h4>Valoraciones Medias ({ratings.length})</h4>
        <div className="ratings-grid">
            <div className="rating-item">Puntualidad<br/><b>{avgField("punctuality")} ⭐</b></div>
            <div className="rating-item">Actitud<br/><b>{avgField("attitude")} ⭐</b></div>
            <div className="rating-item">Intensidad<br/><b>{avgField("intensity")} ⭐</b></div>
            <div className="rating-item">Deportividad<br/><b>{avgField("sportmanship")} ⭐</b></div>
            <div className="rating-item">Técnica<br/><b>{avgField("technique")} ⭐</b></div>
        </div>

        {/* CAMBIO: Nueva sección para el historial de sparrings */}
        <hr />
        <h4>Últimos Sparrings</h4>
        {loading ? (
            <p>Cargando historial...</p>
        ) : history.length > 0 ? (
            <ul className="history-summary-list">
                {history.map((combat) => (
                    <li key={combat._id}>
                        <div className="history-opponent">vs {combat.opponent?.username || 'N/A'}</div>
                        <div className="history-details">
                            <span>{new Date(combat.date).toLocaleDateString()}</span>
                            <span className="separator">|</span>
                            <span>{combat.gym?.name || 'Gimnasio no disponible'}</span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="no-data">Sin sparrings recientes.</p>
        )}
      </div>
    </UserProfileModal>
  );
};

export default SeeProfile;