import React, { useEffect, useState } from "react";
import { getCombats, respondCombat } from "../../services/combatService";
import { Combat } from "../../models/Combat";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import "./MyCombats.css";

const MyCombats: React.FC = () => {
  const { t } = useLanguage();
  const [futureCombats, setFutureCombats] = useState<Combat[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Combat[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);

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
      getCombats({ status: "accepted", user: userId }),
      getCombats({ status: "pending", opponent: userId }),
      getCombats({ status: "pending", creator: userId }),
    ])
      .then(([futureRes, receivedRes, sentRes]) => {
        setFutureCombats(futureRes.combats || []);
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
  }, [userId]);

  useEffect(() => {
    // Actualiza el contador de invitaciones pendientes en localStorage
    localStorage.setItem(
      "pendingInvitations",
      String(receivedInvitations.length)
    );
    window.dispatchEvent(new Event("storage")); // Para refrescar el menú en otras pestañas
  }, [receivedInvitations]);

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

  if (loading)
    return <div className="my-combats-loading">{t("loadingCombats")}</div>;

  return (
    <div className="my-combats-container">
      <h2 className="my-combats-section-title">🗓️ {t("futureCombatsTitle")}</h2>
      {futureCombats.length > 0 ? (
        <ul className="my-combats-list">
          {futureCombats.map((c) => (
            <li key={c._id} className="my-combats-item">
              <div>
                <span className="my-combats-label">{t("date")}:</span>{" "}
                {formatDate(String(c.date))}
                <span className="my-combats-label"> | {t("time")}:</span>{" "}
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-combats-empty">{t("noFutureCombats")}</p>
      )}

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
