import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { fetchCombatHistory } from "../../services/combatService";
import { Rating } from "../../models/Rating";
import { CombatHistoryEntry } from "../../models/Combat";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import {
  followUser,
  unfollowUser,
  checkFollowUser,
  getFollowCounts,
  FollowCounts,
  FollowerItem,
  FollowingItem,
} from "../../services/followService";
import { toast } from "react-toastify";

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
  const [history, setHistory] = useState<CombatHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });

  // Obtener el usuario actual desde localStorage
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) return JSON.parse(userData);
    } catch {}
    return null;
  })();

  const userId = user?._id || user?.id;

  // Refresca el estado de follow usando el endpoint rápido
  const refreshFollowState = async () => {
    if (!userId) return;
    setCheckingFollow(true);
    try {
      const res = await checkFollowUser(userId);
      setIsFollowing(res.data.following);
    } catch (err) {
      setIsFollowing(false);
    } finally {
      setCheckingFollow(false);
    }
  };

  // Comprobar la primera vez que se abra el modal o cambie user
  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      // Pedimos valoraciones y combates en paralelo
      Promise.all([
        getRatingsByUser(userId),
        fetchCombatHistory(userId, 1, 3)
      ]).then(([ratingsResponse, historyResponse]) => {
        setRatings(Array.isArray(ratingsResponse) ? ratingsResponse : []);
        setHistory(historyResponse.combats || []);
      }).catch(err => {
        console.error("Error fetching profile data:", err);
      }).finally(() => {
        setLoading(false);
      });
      // Cargar contadores de seguidores/seguidos
      getFollowCounts(userId)
        .then((res) => {
          setCounts({
            followers: res.data.followers,
            following: res.data.following,
          });
        })
        .catch((err) => {
          console.error(err);
        });
      refreshFollowState();
    }
  }, [open, userId]);

  if (!open || !user) return null;

  // Calcular promedios de cada campo
  const avgField = (field: keyof Rating) =>
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + Number(r[field] ?? 0), 0) /
          ratings.length
        ).toFixed(1)
      : "-";

  // Manejar seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    if (togglingFollow || checkingFollow) return;

    setTogglingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        toast.info("Has dejado de seguir a este usuario");
      } else {
        await followUser(userId);
        toast.success("Ahora sigues a este usuario");
      }
      // Refresca contador y estado de botón
      const countsRes = await getFollowCounts(userId);
      setCounts({
        followers: countsRes.data.followers,
        following: countsRes.data.following,
      });
      await refreshFollowState();
    } catch (err) {
      toast.error("Error al actualizar el seguimiento");
    } finally {
      setTogglingFollow(false);
    }
  };

  return (
    <UserProfileModal open={open} onClose={onClose}>
      <div className="see-profile-content">
        <div className="profile-header">
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.name}
            className="profile-avatar"
          />
          <div className="profile-header-info">
            <h2>{user.name}</h2>
            <p>{user.city}</p>
          </div>
        </div>
        {/* Mostrar contadores de seguidores/seguidos */}
        <div style={{ marginBottom: 10 }}>
          <span style={{ marginRight: 16 }}>
            <b>Siguiendo:</b> {counts.following}
          </span>
          <span>
            <b>Seguidores:</b> {counts.followers}
          </span>
        </div>
        {/* Botón de seguir/dejar de seguir */}
        {currentUser &&
          (user._id || user.id) !== currentUser.id && (
            <button
              className="follow-button"
              onClick={handleFollowToggle}
              disabled={checkingFollow || togglingFollow}
              style={{
                backgroundColor: "#d62828",
                color: "white",
                padding: "8px 16px",
                border: "none",
                marginTop: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {checkingFollow
                ? "..."
                : isFollowing
                ? "Dejar de seguir"
                : "Seguir"}
            </button>
          )}
        <div className="profile-stats-grid">
          <div className="stat-item">
            <span>Peso</span>
            <b>{user.weight}</b>
          </div>
          <div className="stat-item">
            <span>Email</span>
            <b>{user.email}</b>
          </div>
        </div>
        <hr />
        <h4>Valoraciones Medias ({ratings.length})</h4>
        <div className="ratings-grid">
          <div className="rating-item">
            Puntualidad<br />
            <b>{avgField("punctuality")} ⭐</b>
          </div>
          <div className="rating-item">
            Actitud<br />
            <b>{avgField("attitude")} ⭐</b>
          </div>
          <div className="rating-item">
            Intensidad<br />
            <b>{avgField("intensity")} ⭐</b>
          </div>
          <div className="rating-item">
            Deportividad<br />
            <b>{avgField("sportmanship")} ⭐</b>
          </div>
          <div className="rating-item">
            Técnica<br />
            <b>{avgField("technique")} ⭐</b>
          </div>
        </div>
        <hr />
        <h4>Últimos Sparrings</h4>
        {loading ? (
          <p>Cargando historial...</p>
        ) : history.length > 0 ? (
          <ul className="history-summary-list">
            {history.map((combat) => (
              <li key={combat._id}>
                <div className="history-opponent">
                  vs {combat.opponent?.username || 'N/A'}
                </div>
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