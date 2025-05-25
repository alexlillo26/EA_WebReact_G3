import React, { useEffect, useState } from "react";
import { getRatingsByUser } from "../../services/ratingService";
import { Rating } from "../../models/Rating";
import UserProfileModal from "../UserProfileModal/UserProfileModal";

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

  return (
    <UserProfileModal open={open} onClose={onClose}>
      <div style={{ color: "#222" }}>
        <h2 style={{ color: "#d62828" }}>{user.name}</h2>
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
