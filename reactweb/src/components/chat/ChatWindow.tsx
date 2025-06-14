import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageInput from './MessageInput';
import { useAuth } from '../../context/AuthContext';
import { ConversationPreview } from '../../models/chat';
import defaultAvatar from '../../assets/logo.png';

interface ChatWindowProps {
  conversation: ConversationPreview;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const { messages, loading, sendMessage, opponentIsTyping, typingUser, notifyTyping } = useChat(conversation._id);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Función para formatear la fecha a HH:MM
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute:'2-digit'
    });
  };

  if (loading) {
    return <div className="loading-chat">Cargando mensajes...</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img 
          src={conversation.otherParticipant?.profilePicture || defaultAvatar} 
          alt={conversation.otherParticipant?.name}
          className="avatar"
        />
        <h3>{conversation.otherParticipant?.name || 'Cargando...'}</h3>
      </div>

      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={`message-item ${msg.senderId === user?.id ? 'my-message' : 'other-message'}`}>
            <div className="message-bubble">
              {/* Se añade el texto del mensaje */}
              <p className="message-text">{msg.message}</p>
              {/* Se añade el timestamp (hora) del mensaje */}
              <span className="message-timestamp">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        ))}
        {opponentIsTyping && <div className="typing-indicator"><em>{typingUser} está escribiendo...</em></div>}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={sendMessage} onTyping={notifyTyping} />
    </div>
  );
};

export default ChatWindow;