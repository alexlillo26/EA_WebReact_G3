import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { fetchCombatHistory } from "../../services/combatService";
import { Rating } from "../../models/Rating";
import { CombatHistoryEntry } from "../../models/Combat";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import { useLanguage } from "../../context/LanguageContext";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowCounts,
  FollowCounts,
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
  const { t } = useLanguage();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [history, setHistory] = useState<CombatHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
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
    }
  }, [open, userId]);

  // Comprobar si el usuario actual ya sigue al usuario visto
  useEffect(() => {
    if (!open || !user || !currentUser) return;
    let mounted = true;
    setCheckingFollow(true);
    getFollowers(user._id || user.id)
      .then((result) => {
        if (!mounted) return;
        const ids = (result.data?.followers || []).map((rel: any) =>
          rel.follower?._id || rel.follower
        );
        setIsFollowing(ids.includes(currentUser.id));
        setCheckingFollow(false);
      })
      .catch(() => {
        if (mounted) setIsFollowing(false);
        setCheckingFollow(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, user, currentUser]);

  if (!open || !user) return null;

  // Calcular promedios de cada campo
  const avgField = (field: keyof Rating) =>
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + Number(r[field] ?? 0), 0) /
          ratings.length
        ).toFixed(1)
      : "-";

  const getDirections = () => {
    if (!currentUserCity || !user.city) return;
    const origin = encodeURIComponent(currentUserCity);
    const destination = encodeURIComponent(user.city);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, "_blank");
  };

  // Manejar seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    try {
      if (isFollowing) {
        await unfollowUser(user._id || user.id);
        setIsFollowing(false);
        toast.info("Has dejado de seguir a este usuario");
      } else {
        await followUser(user._id || user.id);
        setIsFollowing(true);
        toast.success("Ahora sigues a este usuario");
      }
    } catch (err) {
      toast.error("Error al actualizar el seguimiento");
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
              disabled={checkingFollow}
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
              {isFollowing ? "Dejar de seguir" : "Seguir"}
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