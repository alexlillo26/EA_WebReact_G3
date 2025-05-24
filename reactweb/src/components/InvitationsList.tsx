import React, { useEffect, useState } from 'react';
import './InvitationsList.css';
import { toast } from 'react-toastify';
import { respondCombat, fetchInvitations } from '../services/combatService';
import { socket } from '../socket';
import { Combat } from '../models/Combat';

// Si ves el error "Cannot find module 'react-toastify'", instala con:
// npm install react-toastify

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchInvitations();
        setInvitations(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Error carregant invitacions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Escuchar invitaciones en tiempo real
    const handleNewInvitation = (combat: Combat) => {
      console.log("[Socket] Nueva invitación recibida:", combat);
      setInvitations((prev) => [combat, ...prev]);
      toast.info("¡Nueva invitación de combate recibida!");
    };
    socket.on("newCombatInvitation", handleNewInvitation);

    return () => {
      socket.off("newCombatInvitation", handleNewInvitation);
    };
  }, []);

  const handleResponse = async (combatId: string, accepted: boolean) => {
    try {
      await respondCombat(combatId, accepted ? 'accepted' : 'rejected');
      socket.emit('respond_combat', { combatId, status: accepted ? 'accepted' : 'rejected' });
      setInvitations((prev) => prev.filter((c) => c._id !== combatId));
      toast(accepted ? '✅ Has acceptat la invitació' : '❌ Has rebutjat la invitació');
    } catch {
      toast.error('Error al respondre la invitació');
    }
  };

  if (loading) return <div>Carregant invitacions...</div>;

  return (
    <div className="invitations-container">
      <h2 className="invitations-title">📨 Invitacions de combat</h2>
      {invitations.length === 0 ? (
        <p className="no-invitations">No tens invitacions pendents.</p>
      ) : (
        <ul className="invitations-list">
          {invitations.map((combat: any) => (
            <li key={combat._id} className="invitation-item">
              <div className="combat-info">
                <strong>Gimnàs:</strong> {
                  combat.gym && typeof combat.gym === 'object'
                    ? (combat.gym.name || combat.gym._id)
                    : (typeof combat.gym === 'string' ? combat.gym : '-')
                } <br />
                <strong>Data:</strong> {new Date(combat.date).toLocaleDateString()} <br />
                <strong>Nivell:</strong> {combat.level}
              </div>
              <div className="combat-actions">
                <button
                  onClick={() => combat._id && handleResponse(combat._id, true)}
                  className="accept-btn"
                  disabled={!combat._id}
                >
                  ✅ Acceptar
                </button>
                <button
                  onClick={() => combat._id && handleResponse(combat._id, false)}
                  className="reject-btn"
                  disabled={!combat._id}
                >
                  ❌ Rebutjar
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
