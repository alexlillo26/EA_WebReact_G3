import React, { useEffect, useState } from "react";
import "./InvitationsList.css";
import { toast } from "react-toastify";
import { respondCombat, fetchInvitations } from "../../services/combatService";
import { socket } from "../../socket";
import { Combat } from "../../models/Combat";
import { useLanguage } from "../../context/LanguageContext";

// Si ves el error "Cannot find module 'react-toastify'", instala con:
// npm install react-toastify

const InvitationsList: React.FC = () => {
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchInvitations();
        setInvitations(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          toast.info(
            `Tienes ${data.length} combate(s) pendiente(s) de aceptar o rechazar`
          );
        }
      } catch (error) {
        toast.error(t("invitationsList.errorLoading"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    useEffect(() => {
      // Guarda el número de invitaciones pendientes en localStorage
      localStorage.setItem("pendingInvitations", String(invitations.length));
      // Notifica a otras pestañas (opcional)
      window.dispatchEvent(new Event("storage"));
    }, [invitations]);

    // Escuchar invitaciones en tiempo real
    const handleNewInvitation = (combat: Combat) => {
      console.log("[Socket] Nueva invitación recibida:", combat);
      setInvitations((prev) => [combat, ...prev]);
      toast.info(t("invitationsList.newInvitationToast"));
    };
    socket.on("newCombatInvitation", handleNewInvitation);

    return () => {
      socket.off("newCombatInvitation", handleNewInvitation);
    };
  }, []);

  const handleResponse = async (combatId: string, accepted: boolean) => {
    try {
      await respondCombat(combatId, accepted ? "accepted" : "rejected");
      socket.emit("respond_combat", {
        combatId,
        status: accepted ? "accepted" : "rejected",
      });
      setInvitations((prev) => prev.filter((c) => c._id !== combatId));
      toast(
        accepted ? t("invitationsList.accepted") : t("invitationsList.rejected")
      );
    } catch {
      toast.error(t("invitationsList.errorResponding"));
    }
  };

  if (loading) return <div>{t("invitationsList.loading")}</div>;

  return (
    <div className="invitations-container">
      <h2 className="invitations-title">📨 {t("invitationsList.title")}</h2>
      {invitations.length === 0 ? (
        <p className="no-invitations">{t("invitationsList.noInvitations")}</p>
      ) : (
        <ul className="invitations-list">
          {invitations.map((combat: any) => (
            <li key={combat._id} className="invitation-item">
              <div className="combat-info">
                <strong>{t("invitationsList.gym")}:</strong>{" "}
                {combat.gym && typeof combat.gym === "object"
                  ? combat.gym.name || combat.gym._id
                  : typeof combat.gym === "string"
                  ? combat.gym
                  : "-"}{" "}
                <br />
                <strong>{t("invitationsList.date")}:</strong>{" "}
                {new Date(combat.date).toLocaleDateString()} <br />
                <strong>{t("invitationsList.time")}:</strong>{" "}
                {combat.time ? combat.time : "-"} <br />
                <strong>{t("invitationsList.level")}:</strong> {combat.level}
              </div>
              <div className="combat-actions">
                <button
                  onClick={() => combat._id && handleResponse(combat._id, true)}
                  className="accept-btn"
                  disabled={!combat._id}
                >
                  ✅ {t("invitationsList.accept")}
                </button>
                <button
                  onClick={() =>
                    combat._id && handleResponse(combat._id, false)
                  }
                  className="reject-btn"
                  disabled={!combat._id}
                >
                  ❌ {t("invitationsList.reject")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvitationsList;
