import React, { useState, useEffect } from 'react';
import { getMyConversations } from '../../services/chatApi';
import { ConversationPreview } from '../../models/chat';
import defaultAvatar from '../../assets/logo.png'; // Importa una imagen por defecto

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationPreview) => void;
  activeConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, activeConversationId }) => {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyConversations()
      .then(data => {
        setConversations(data.conversations);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '16px' }}>Cargando conversaciones...</p>;

  return (
    <>
      <div className="conversation-list-header">Chats</div>
      <ul className="conversation-list">
        {conversations.length === 0 ? (
          <p style={{ padding: '16px' }}>No tienes conversaciones activas.</p>
        ) : (
          conversations.map((conv) => (
            <li
              key={conv._id}
              className={`conversation-item ${conv._id === activeConversationId ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <img
                src={conv.otherParticipant?.profilePicture || defaultAvatar}
                alt={conv.otherParticipant?.name}
                className="avatar"
              />
              <div className="conversation-details">
                <strong>{conv.otherParticipant?.name || 'Usuario desconocido'}</strong>
                <p>{conv.lastMessage?.message || 'Inicia la conversación...'}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
};

export default ConversationList;