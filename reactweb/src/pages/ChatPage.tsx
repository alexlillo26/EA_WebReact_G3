import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import './ChatPage.css';
import { ConversationPreview } from '../models/chat'; // Importamos el tipo

const ChatPage: React.FC = () => {
  // Ahora guardaremos el objeto de conversación completo, no solo el ID
  const [selectedConversation, setSelectedConversation] = useState<ConversationPreview | null>(null);
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    if (location.state?.newConversationId) {
      // Si llegamos desde "Contactar", aún no tenemos los datos del participante,
      // así que por ahora solo establecemos el ID. La lista se actualizará sola.
      const newId = location.state.newConversationId;
      setSelectedConversation({ _id: newId, otherParticipant: null, unreadCount: 0, updatedAt: new Date().toISOString() }); // Objeto temporal
      window.history.replaceState({}, document.title);
    }
    // La lógica para `params.conversationId` se puede mejorar con una llamada a la API
    // para obtener los detalles de esa conversación específica.
  }, [location.state, params.conversationId]);

  return (
    <div className="chat-page-container">
      <div className="conversation-list-panel">
        <ConversationList
          onSelectConversation={setSelectedConversation}
          activeConversationId={selectedConversation?._id || null}
        />
      </div>
      <div className="chat-window-panel">
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation._id} // Importante: resetea el componente al cambiar de chat
            conversation={selectedConversation}
          />
        ) : (
          <div className="no-chat-selected">
            <h2>Face2Face Chat</h2>
            <p>Selecciona una conversación para empezar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;