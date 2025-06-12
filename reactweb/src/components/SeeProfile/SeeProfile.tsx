import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { Rating } from "../../models/Rating";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
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
  const [ratings, setRatings] = useState<Rating[]>([]);
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

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (open && userId) {
      setLoading(true);
      getRatingsByUser(userId).then((res) => {
        setRatings(Array.isArray(res) ? res : []);
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
  }, [open, user]);

  // Comprobar si el usuario actual ya sigue al usuario visto
  useEffect(() => {
    if (!open || !user || !currentUser) return;
    let mounted = true;
    setCheckingFollow(true);
    getFollowers(user._id || user.id)
      .then((result) => {
        if (!mounted) return;
        // Accede correctamente a result.data.followers
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
  }, [open]); // Solo se ejecuta al abrir/cerrar el modal

  if (!open || !user) return null;

  // Calcular promedios de cada campo
  const avgField = (field: keyof Rating) =>
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + Number(r[field] ?? 0), 0) /
          ratings.length
        ).toFixed(2)
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
        await unfollowUser(user._id || user.id); // Solo pasa el id del usuario a dejar de seguir
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
      <div style={{ color: "#222" }}>
        <h2 style={{ color: "#d62828" }}>{user.name}</h2>
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
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>Ciudad:</b> {user.city}
          {currentUserCity && user.city && (
            <button className="ver-ruta-button" onClick={getDirections}>
              Ver ruta
            </button>
          )}
        </p>
        <p>
          <b>Peso:</b> {user.weight}
        </p>
        <div style={{ margin: "18px 0 10px 0" }}>
          <b>Valoraciones medias:</b>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              Puntualidad: <b>{avgField("punctuality")}</b> ⭐
            </li>
            <li>
              Actitud: <b>{avgField("attitude")}</b> ⭐
            </li>
            <li>
              Intensidad: <b>{avgField("intensity")}</b> ⭐
            </li>
            <li>
              Deportividad: <b>{avgField("sportmanship")}</b> ⭐
            </li>
            <li>
              Técnica: <b>{avgField("technique")}</b> ⭐
            </li>
          </ul>
          <span style={{ color: "#888", fontSize: "0.95em" }}>
            ({ratings.length} valoraciones)
          </span>
        </div>
        <hr />
        <h4>Comentarios recientes:</h4>
        {loading ? (
          <p>Cargando valoraciones...</p>
        ) : ratings.length === 0 ? (
          <p>Sin valoraciones aún.</p>
        ) : (
          <ul
            style={{
              textAlign: "left",
              maxHeight: 200,
              overflowY: "auto",
              padding: 0,
            }}
          >
            {ratings.slice(0, 5).map((r) => (
              <li
                key={r._id}
                style={{
                  marginBottom: 10,
                  background: "#fafafa",
                  borderRadius: 6,
                  padding: 8,
                }}
              >
                <div>
                  <b>Puntualidad:</b> {r.punctuality} ⭐ | <b>Actitud:</b>{" "}
                  {r.attitude} ⭐ | <b>Intensidad:</b> {r.intensity} ⭐ |{" "}
                  <b>Deportividad:</b> {r.sportmanship} ⭐ | <b>Técnica:</b>{" "}
                  {r.technique ?? "-"} ⭐
                </div>
                {r.comment && (
                  <div style={{ marginTop: 4, color: "#444" }}>
                    <i>"{r.comment}"</i>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserProfileModal>
  );
};

export default SeeProfile;
