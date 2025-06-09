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
        setRatings(Array.isArray(res) ? res : []);
        setLoading(false);
      });
    }
  }, [open, user]);

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
