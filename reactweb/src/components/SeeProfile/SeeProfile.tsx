import React, { useEffect, useState } from "react";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import { getUserById } from "../../services/userService";
import { fetchUserStatistics } from "../../services/statisticsService";
import { fetchCombatHistory } from "../../services/combatService";
import { RatingStars } from "../RatingStars/RatingStars";
import { CombatHistoryEntry, IUserStatistics } from "../../models/Combat";
import { useLanguage } from "../../context/LanguageContext";
import {
  followUser,
  unfollowUser,
  checkFollowUser,
  getFollowCounts,
  FollowCounts,
} from "../../services/followService";
import "./SeeProfile.css";

// Etiquetas profesionales para las valoraciones
const ratingLabels: Record<string, string> = {
  punctuality: "Puntualidad",
  attitude: "Actitud",
  intensity: "Intensidad",
  sportmanship: "Deportividad",
  technique: "Técnica",
};

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const SeeProfile: React.FC<Props> = ({ open, onClose, userId }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<IUserStatistics | null>(null);
  const [history, setHistory] = useState<CombatHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para follow
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [counts, setCounts] = useState<FollowCounts>({
    followers: 0,
    following: 0,
  });
  const [loadingFollow, setLoadingFollow] = useState<boolean>(false);

  // Usuario actual
  const currentUser = (() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) return JSON.parse(userData);
    } catch {
      console.error("Error parsing user data from localStorage");
    }
    return null;
  })();

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);

    Promise.all([
      getUserById(userId),
      fetchUserStatistics(userId),
      fetchCombatHistory(userId, 1, 3),
    ])
      .then(([userRes, statsRes, historyRes]) => {
        setProfile(userRes);
        setStats(statsRes);
        setHistory(historyRes.combats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Consultar follow y contadores
    checkFollowUser(userId)
      .then((res) => setIsFollowing(res.data.following))
      .catch(() => setIsFollowing(false));
    getFollowCounts(userId)
      .then((res) => setCounts(res.data))
      .catch(() => {
        setCounts({ followers: 0, following: 0 });
      });
  }, [open, userId]);

  // Toggle seguir/dejar de seguir
  const handleFollowToggle = async () => {
    if (loadingFollow || !currentUser || currentUser.id === userId) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      // Refresca estado y contadores
      const [{ data: followRes }, { data: countsRes }] = await Promise.all([
        checkFollowUser(userId),
        getFollowCounts(userId),
      ]);
      setIsFollowing(followRes.following);
      setCounts(countsRes);
    } catch {
      // Silenciar error
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!open) return null;
  if (loading) return <p>Cargando perfil…</p>;

  return (
    <UserProfileModal open onClose={onClose}>
      <div
        className="see-profile-content"
        style={{ maxWidth: 420, margin: "0 auto" }}
      >
        <div
          className="profile-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 18,
          }}
        >
          <img
            src={
              profile.profilePicture && profile.profilePicture.trim() !== ""
                ? profile.profilePicture
                : "/logo.png" /* Cambia aquí por la ruta de tu logo */
            }
            alt={profile.name}
            className="profile-avatar"
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #d62828",
            }}
          />
          <div>
            <h2 style={{ margin: 0, color: "#d62828" }}>{profile.name}</h2>
            <div style={{ display: "flex", gap: 16, margin: "8px 0" }}>
              <span>
                <b>{t("profile.gender")}:</b> {profile.gender || "-"}
              </span>
              <span>
                <b>{t("profile.category")}:</b> {profile.weight || "-"}
              </span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span>
                <b>{t("profile.city")}:</b> {profile.city || "-"}
              </span>
            </div>
            <div>
              <span>
                <b>{t("profile.email")}:</b> {profile.email}
              </span>
            </div>
          </div>
        </div>

        {/* Botón seguir/dejar de seguir y contadores */}
        {currentUser && currentUser.id !== userId && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={handleFollowToggle}
              disabled={loadingFollow}
              style={{
                backgroundColor: "#d62828",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 16,
              }}
            >
              {loadingFollow
                ? "…"
                : isFollowing
                ? t("profile.unfollow")
                : t("profile.follow")}
            </button>
            <span>
              <b>{t("profile.following")}:</b> {counts.following}
            </span>
            <span style={{ marginLeft: 12 }}>
              <b>{t("profile.followers")}:</b> {counts.followers}
            </span>
          </div>
        )}

        <hr />

        {/* Media de ratings - diseño destacado */}
        <h4
          style={{
            marginBottom: 12,
            marginTop: 24,
            color: "#d62828",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 1,
          }}
        >
          {t("profile.ratingsAverage")}
        </h4>
        {stats?.ratingAverages ? (
          <div
            style={{
              background: "#1f1f1f",
              borderRadius: 12,
              padding: "18px 20px",
              marginBottom: 18,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              border: "1.5px solid #d62828",
            }}
          >
            {Object.entries(stats.ratingAverages).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minWidth: 80,
                  gap: 10,
                  padding: "2px 0",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#fff",
                    fontSize: 16,
                    minWidth: 110,
                  }}
                >
                  {ratingLabels[key] || key}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <RatingStars value={Number(val)} readOnly />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#d62828",
                      marginLeft: 2,
                      minWidth: 32,
                      textAlign: "right",
                    }}
                  >
                    {Number(val).toFixed(1)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888", fontStyle: "italic" }}>
            {t("profile.noRatings")}
          </p>
        )}

        <hr />

        {/* Sparrings recientes - resalta el vs y muestra info secundaria */}
        <h4
          style={{
            marginBottom: 12,
            marginTop: 24,
            color: "#d62828",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 1,
          }}
        >
          {t("profile.recentSparrings")}
        </h4>
        {history.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginBottom: 12,
            }}
          >
            {history.map((c) => {
              // Determina el "otro" participante
              const isCreator = (c as any).creator?._id === userId;
              const other = isCreator ? c.opponent : (c as any).creator;
              const opponentName =
                (other as any)?.username || (other as any)?.name || "N/A";
              return (
                <div
                  key={c._id}
                  style={{
                    background: "#232323",
                    borderRadius: 8,
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    borderLeft: "4px solid #d62828",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 2,
                      letterSpacing: 0.5,
                    }}
                  >
                    <span style={{ color: "#d62828" }}>vs</span> {opponentName}
                  </span>
                  <span
                    style={{
                      color: "#bbb",
                      fontWeight: 500,
                      fontSize: 15,
                      marginBottom: 2,
                    }}
                  >
                    <b>{t("profile.date")}:</b>{" "}
                    {new Date(c.date).toLocaleDateString()}
                  </span>
                  <span
                    style={{
                      color: "#bbb",
                      fontWeight: 500,
                      fontSize: 15,
                    }}
                  >
                    <b>{t("profile.gym")}:</b> {c.gym?.name || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#888", fontStyle: "italic" }}>
            {t("profile.noSparrings")}
          </p>
        )}
      </div>
    </UserProfileModal>
  );
};

export default SeeProfile;
