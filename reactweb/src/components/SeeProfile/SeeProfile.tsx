import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { Rating } from "../../models/Rating";
import UserProfileModal from "../UserProfileModal/UserProfileModal";
import {
  followUser,
  unfollowUser,
  getFollowers,
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
        setRatings(res);
        setLoading(false);
      });
    }
  }, [open, user]);

  // Comprobar si el usuario actual ya sigue al usuario visto
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!user || !currentUser || (user._id || user.id) === currentUser.id) {
        setIsFollowing(false);
        return;
      }
      setCheckingFollow(true);
      try {
        const result = await getFollowers(user._id || user.id);
        if (
          result &&
          typeof result === "object" &&
          "followers" in result &&
          Array.isArray(result.followers)
        ) {
          const isUserFollowed = result.followers.some(
            (rel: any) =>
              rel.follower === currentUser.id ||
              (rel.follower?._id || rel.follower?.id) === currentUser.id
          );
          setIsFollowing(isUserFollowed);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        setIsFollowing(false);
      } finally {
        setCheckingFollow(false);
      }
    };
    if (open && user && currentUser) {
      fetchFollowers();
    }
  }, [open, user, currentUser]);

  if (!open || !user) return null;

  const avg =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(
          2
        )
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
      <div style={{ color: "#222" }}>
        <h2 style={{ color: "#d62828" }}>{user.name}</h2>
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
        <p>
          <b>Valoración media:</b> {avg} ⭐ ({ratings.length} valoraciones)
        </p>
        <hr />
        <h4>Comentarios recientes:</h4>
        {loading ? (
          <p>Cargando valoraciones...</p>
        ) : ratings.length === 0 ? (
          <p>Sin valoraciones aún.</p>
        ) : (
          <ul style={{ textAlign: "left", maxHeight: 200, overflowY: "auto" }}>
            {ratings.slice(0, 5).map((r) => (
              <li key={r._id}>
                <b>{r.score}⭐</b> {r.comment && `- "${r.comment}"`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </UserProfileModal>
  );
};

export default SeeProfile;
