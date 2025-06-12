import React, { useEffect, useState } from "react";
import {
  getCombats,
  respondCombat,
  cancelCombatService,
} from "../../services/combatService";
import { Combat } from "../../models/Combat";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { RatingModal } from "../RatingModal/RatingModal";
import { createRating, getRatingFromTo } from "../../services/ratingService";
import { Rating } from "../../models/Rating";
import { updateCombatImage } from "../../services/combatService";
import "./MyCombats.css";
import { CancelCombatModal } from "../CancelCombatModal/CancelCombatModal";

const MyCombats: React.FC = () => {
  const { t } = useLanguage();
  const [futureCombats, setFutureCombats] = useState<Combat[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Combat[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [combatToRate, setCombatToRate] = useState<Combat | null>(null);
  const [ratedCombats, setRatedCombats] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedCombatId, setSelectedCombatId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [combatToCancel, setCombatToCancel] = useState<Combat | null>(null);

  // Obtener el id y nombre del usuario actual
  const userData = (() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch {}
    return null;
  })();
  const userId = userData?.id;
  const userName = userData?.name;

  // Helper para mostrar fecha bonita
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  function formatTime(time: string) {
    return time?.length === 5 ? time : time || "-";
  }

  // Helper para obtener el oponente real (el otro usuario)
  function getOpponent(combat: Combat) {
    if (!combat) return "-";
    // Si el usuario es el creador, el oponente es combat.opponent, si es el oponente, el oponente es combat.creator
    if (combat.creator === userId) {
      // Buscar nombre del oponente
      if (
        (combat as any).opponent &&
        typeof (combat as any).opponent === "object" &&
        (combat as any).opponent.name
      ) {
        return (combat as any).opponent.name;
      }
      // Buscar en boxers
      if (Array.isArray((combat as any).boxers)) {
        const other = (combat as any).boxers.find(
          (b: any) =>
            (typeof b === "object" &&
              b._id !== userId &&
              b.name !== userName) ||
            (typeof b === "string" && b !== userId && b !== userName)
        );
        if (other)
          return typeof other === "object" ? other.name || other._id : other;
      }
      // Fallback
      return combat.opponent;
    } else {
      if (
        (combat as any).creator &&
        typeof (combat as any).creator === "object" &&
        (combat as any).creator.name
      ) {
        return (combat as any).creator.name;
      }
      if (Array.isArray((combat as any).boxers)) {
        const other = (combat as any).boxers.find(
          (b: any) =>
            (typeof b === "object" &&
              b._id !== userId &&
              b.name !== userName) ||
            (typeof b === "string" && b !== userId && b !== userName)
        );
        if (other)
          return typeof other === "object" ? other.name || other._id : other;
      }
      return combat.creator;
    }
  }

  // Helper para obtener el oponente para la sección de futuros combates (nunca igual al usuario logueado)
  function getOpponentForFuture(combat: Combat) {
    // Si el usuario es el creador y el oponente coincide con el usuario logueado, muestra el creador como oponente
    if (
      (combat.creator === userId ||
        (combat as any).creator?.name === userName) &&
      (combat.opponent === userId ||
        (combat as any).opponent?.name === userName)
    ) {
      // Si ambos son iguales, muestra el creador como oponente
      return (combat as any).creator?.name || combat.creator || "-";
    }
    // Si el oponente coincide con el usuario logueado, muestra el creador
    if (
      combat.opponent === userId ||
      (combat as any).opponent?.name === userName
    ) {
      return (combat as any).creator?.name || combat.creator || "-";
    }
    // Si el creador coincide con el usuario logueado, muestra el oponente
    if (
      combat.creator === userId ||
      (combat as any).creator?.name === userName
    ) {
      return (combat as any).opponent?.name || combat.opponent || "-";
    }
    // Si ninguno coincide, usa el helper normal
    return getOpponent(combat);
  }

  // Helper para obtener dirección del gimnasio
  function getGymAddress(combat: any) {
    if (combat.gym && typeof combat.gym === "object") {
      return combat.gym.place || "";
    }
    return "";
  }

  // Refresca todos los datos de combates
  const refreshCombats = () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getCombats({ status: "accepted", user: userId, page: currentPage }), // <-- añade page aquí
      getCombats({ status: "pending", opponent: userId }),
      getCombats({ status: "pending", creator: userId }),
    ])
      .then(([futureRes, receivedRes, sentRes]) => {
        setFutureCombats(futureRes.combats || []);
        setTotalPages(futureRes.totalPages || 1); // <-- guarda el total de páginas
        setReceivedInvitations(receivedRes.combats || []);
        setSentInvitations(sentRes.combats || []);
      })
      .catch(() => {
        toast.error("Error cargando combates");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshCombats();
    // eslint-disable-next-line
  }, [userId, currentPage]);

  useEffect(() => {
    // Actualiza el contador de invitaciones pendientes en localStorage
    localStorage.setItem(
      "pendingInvitations",
      String(receivedInvitations.length)
    );
    window.dispatchEvent(new Event("storage")); // Para refrescar el menú en otras pestañas
  }, [receivedInvitations]);

  function canRateCombat(combat: Combat) {
    const combatDate = new Date(combat.date);
    const combatTime = combat.time || "00:00";
    const [hours, minutes] = combatTime.split(":").map(Number);
    combatDate.setHours(hours, minutes, 0, 0);
    const combatEnd = new Date(combatDate.getTime() + 60 * 60 * 1000); // +1h
    return new Date() > combatEnd;
  }

  function getUserId(user: any): string {
    if (user && typeof user === "object" && "_id" in user) {
      return user._id;
    }
    return user;
  }

  useEffect(() => {
    const fetchRatings = async () => {
      if (!userId || futureCombats.length === 0) return;
      const ratings = await Promise.all(
        futureCombats.map(async (c) => {
          const opponentId = c.creator === userId ? c.opponent : c.creator;
          const rating = await getRatingFromTo(userId, opponentId);
          return { combatId: c._id, rated: !!rating };
        })
      );
      setRatedCombats(
        ratings.reduce((acc, curr) => {
          if (curr.combatId) {
            acc[String(curr.combatId)] = curr.rated;
          }
          return acc;
        }, {} as { [key: string]: boolean })
      );
    };
    fetchRatings();
  }, [futureCombats, userId]);

  const handleInvitationResponse = async (
    combatId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await respondCombat(combatId, status);
      toast.success(status === "accepted" ? t("accept") : t("decline"));
      refreshCombats(); // Refresca todo tras aceptar/rechazar
      const userData = localStorage.getItem("userData");
      if (userData) {
        const { id } = JSON.parse(userData);
        getCombats({ status: "pending", opponent: id }).then((res) => {
          const count = res.combats ? res.combats.length : 0;
          localStorage.setItem("pendingInvitations", String(count));
          window.dispatchEvent(new Event("storage")); // Para refrescar en otras pestañas
        });
      }
    } catch {
      toast.error("Error al responder la invitación");
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    combatId: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      await updateCombatImage(combatId, e.target.files[0]);
      refreshCombats(); // Refresca la lista tras actualizar
    }
  };

  const handleCancelCombat = async (reason: string) => {
    if (!combatToCancel || !combatToCancel._id) return;
    await cancelCombatService(combatToCancel._id, reason); // Llama al backend
    setCancelModalOpen(false);
    setCombatToCancel(null);
    refreshCombats(); // Refresca la lista
  };

  const handleRateSubmit = async ({
    punctuality,
    attitude,
    intensity,
    sportmanship,
    technique,
    comment,
  }: {
    punctuality: number;
    attitude: number;
    intensity: number;
    sportmanship: number;
    technique: number;
    comment: string;
  }) => {
    if (!combatToRate || !userId) {
      console.log("No hay combate para calificar o no hay userId");
      return;
    }
    let opponentId: string;

    if (getUserId(combatToRate.creator) === userId) {
      opponentId = getUserId(combatToRate.opponent);
    } else {
      opponentId = getUserId(combatToRate.creator);
    }

    const result = await createRating({
      combat: combatToRate._id!,
      from: userId,
      to: opponentId,
      punctuality,
      attitude,
      intensity,
      sportmanship,
      technique,
      comment,
    });
    console.log("Rating result:", result);
    setRatingModalOpen(false);
    setCombatToRate(null);
    setFutureCombats((prev) => prev.filter((c) => c._id !== combatToRate._id));
  };

  if (loading)
    return <div className="my-combats-loading">{t("loadingCombats")}</div>;

  return (
    <div className="my-combats-container">
      <h2 className="my-combats-section-title">🗓️ {t("futureCombatsTitle")}</h2>
      {futureCombats.length > 0 ? (
        <>
          <ul className="my-combats-list">
            {futureCombats
              .slice()
              .sort((a, b) => {
                // Ordena por fecha y hora ascendente (más reciente primero)
                const dateA = new Date(
                  `${a.date}T${a.time || "00:00"}`
                ).getTime();
                const dateB = new Date(
                  `${b.date}T${b.time || "00:00"}`
                ).getTime();
                return dateA - dateB;
              })
              .map((c) => (
                <li
                  key={c._id}
                  className="my-combats-item"
                  style={
                    c.image
                      ? {
                          backgroundImage: `url(${c.image}${
                            c.image.includes("cloudinary")
                              ? ""
                              : `?${Date.now()}`
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }
                      : undefined
                  }
                >
                  <div
                    style={{
                      background: "none",
                      padding: "8px",
                      borderRadius: "8px",
                      color: "#fff",
                      textShadow: "1px 1px 6px #000",
                    }}
                  >
                    <span className="my-combats-label">{t("date")}:</span>{" "}
                    {formatDate(String(c.date))}
                    <span className="my-combats-label">
                      {" "}
                      | {t("time")}:
                    </span>{" "}
                    {formatTime(c.time)}
                  </div>
                  <div>
                    <span className="my-combats-label">{t("gym")}:</span>{" "}
                    {(c as any).gym?.name || (c as any).gym || "-"}
                    {getGymAddress(c) && (
                      <span className="my-combats-gym-address">
                        {" "}
                        ({getGymAddress(c)})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="my-combats-label">{t("opponent")}:</span>{" "}
                    {getOpponentForFuture(c)}
                  </div>
                  {canRateCombat(c) && !ratedCombats[String(c._id)] && (
                    <button
                      className="rate-opponent-btn"
                      onClick={() => {
                        setCombatToRate(c);
                        setRatingModalOpen(true);
                      }}
                    >
                      {t("rateOpponent")}
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    id={`file-input-${c._id}`}
                    onChange={(e) => handleImageChange(e, c._id!)}
                  />
                  <label
                    htmlFor={`file-input-${c._id}`}
                    className="file-upload-btn2"
                  >
                    {c.image ? "Cambiar foto" : "Añadir foto"}
                  </label>
                  {!canRateCombat(c) && (
                    <button
                      className="cancel-combat-btn"
                      onClick={() => {
                        setCombatToCancel(c);
                        setCancelModalOpen(true);
                      }}
                    >
                      Cancelar combate
                    </button>
                  )}
                </li>
              ))}
          </ul>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <p className="my-combats-empty">{t("noFutureCombats")}</p>
      )}
      <RatingModal
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRateSubmit}
        opponentName={combatToRate ? getOpponentForFuture(combatToRate) : ""}
      />
      <CancelCombatModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelCombat}
      />
      <h2 className="my-combats-section-title">📩 {t("invitationsTitle")}</h2>
      {receivedInvitations.length > 0 ? (
        <ul className="my-combats-list">
          {receivedInvitations.map((c) => (
            <li key={c._id} className="my-combats-item">
              <div>
                <span className="my-combats-label">{t("fromCreator")}:</span>{" "}
                {(c as any).creator?.name || c.creator || "-"}
                <span className="my-combats-label"> | {t("gym")}:</span>{" "}
                {(c as any).gym?.name || (c as any).gym || "-"}
                {getGymAddress(c) && (
                  <span className="my-combats-gym-address">
                    {" "}
                    ({getGymAddress(c)})
                  </span>
                )}
              </div>
              <div className="my-combats-actions">
                <button
                  className="my-combats-accept"
                  onClick={() => handleInvitationResponse(c._id!, "accepted")}
                >
                  {t("accept")}
                </button>
                <button
                  className="my-combats-decline"
                  onClick={() => handleInvitationResponse(c._id!, "rejected")}
                >
                  {t("decline")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-combats-empty">{t("noInvitations")}</p>
      )}
      <h2 className="my-combats-section-title">
        ⏳ {t("pendingCombatsSentTitle")}
      </h2>
      {sentInvitations.length > 0 ? (
        <ul className="my-combats-list">
          {sentInvitations.map((c) => (
            <li key={c._id} className="my-combats-item">
              <div>
                <span className="my-combats-label">{t("toOpponent")}:</span>{" "}
                {(c as any).opponent?.name || c.opponent || "-"}
                <span className="my-combats-label"> | {t("date")}:</span>{" "}
                {formatDate(String(c.date))}
                <span className="my-combats-label"> | {t("status")}:</span>{" "}
                {t("waitingForResponse") || "Esperando una respuesta"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-combats-empty">{t("noPendingCombatsSent")}</p>
      )}
    </div>
  );
};

export default MyCombats;
