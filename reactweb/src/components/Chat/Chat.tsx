import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useCombatChat } from '../../services/chatService'; // Ajusta la ruta
import { CombatChatNotification } from '../../models/Chat'; // Ajusta la ruta

interface CombatChatProps {
  combatId: string;
  userToken: string; // Token JWT del usuario actual
  currentUserId: string; // ID del usuario actual (logueado)
  currentUsername: string; // Nombre del usuario actual (logueado)
}

const CombatChat: React.FC<CombatChatProps> = ({
  combatId,
  userToken,
  currentUserId,
  currentUsername,
}) => {
  const {
    messages,
    sendMessage,
    sendTypingStatus,
    opponentTypingInfo,
    isConnected,
    lastNotification,
  } = useCombatChat({ combatId, userToken, currentUserId });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // Para auto-scroll
  const [displayNotification, setDisplayNotification] = useState<CombatChatNotification | null>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Efecto para mostrar notificaciones temporalmente
  useEffect(() => {
    if (lastNotification) {
      setDisplayNotification(lastNotification);
      const timer = setTimeout(() => {
        setDisplayNotification(null);
      }, 3000); // Mostrar notificación por 3 segundos
      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue(''); // Limpiar input
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      sendTypingStatus(true); // Informar que está escribiendo
    } else {
      sendTypingStatus(false); // Informar que dejó de escribir (si borra todo)
    }
  };

  useEffect(() => {
    if (!userToken) {
      console.error("Token JWT no encontrado. Asegúrate de que el usuario haya iniciado sesión.");
    }
    if (!currentUserId) {
      console.error("ID de usuario no encontrado. Asegúrate de que el token JWT contenga el campo 'id'.");
    }
    if (!currentUsername) {
      console.error("Nombre de usuario no encontrado. Asegúrate de que el token JWT contenga el campo 'username'.");
    }
  }, [userToken, currentUserId, currentUsername]);

  useEffect(() => {
  console.log("Combat ID:", combatId);
  console.log("User Token:", userToken);
  console.log("Current User ID:", currentUserId);
  console.log("Current Username:", currentUsername);
}, [combatId, userToken, currentUserId, currentUsername]);


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        Chat: {combatId ? `${combatId.substring(0, 8)}...` : "ID no disponible"}
        <span
          style={{
            color: isConnected ? 'green' : 'red',
            fontSize: '0.8em',
            marginLeft: '10px',
          }}
        >
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
      {displayNotification && (
        <div
          style={{
            ...styles.notificationBanner,
            backgroundColor:
              displayNotification.type === 'error'
                ? '#ffebee'
                : displayNotification.type === 'success'
                ? '#e8f5e9'
                : '#e3f2fd',
            color:
              displayNotification.type === 'error'
                ? '#c62828'
                : displayNotification.type === 'success'
                ? '#2e7d32'
                : '#0d47a1',
          }}
        >
          {displayNotification.message}
        </div>
      )}

      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div
            key={msg.id} // Usar el ID único generado en el cliente
            style={{
              ...styles.messageBubbleBase,
              ...(msg.isMe ? styles.myMessage : styles.opponentMessage),
            }}
          >
            <strong style={styles.senderName}>
              {msg.isMe ? currentUsername || 'Yo' : msg.senderUsername || 'Oponente'}
            </strong>
            <p style={styles.messageText}>{msg.message}</p>
            <span style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Para auto-scroll */}
      </div>

      {opponentTypingInfo?.isTyping && (
        <p style={styles.typingIndicator}>
          {opponentTypingInfo.username || 'Oponente'} está escribiendo...
        </p>
      )}

      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isConnected ? 'Escribe un mensaje...' : 'Conectando al chat...'}
          style={styles.inputField}
          disabled={!isConnected}
        />
        <button
          type="submit"
          style={styles.sendButton}
          disabled={!isConnected || !inputValue.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

// Estilos (puedes moverlos a un archivo .css o usar styled-components, etc.)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '500px',
    height: '600px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    margin: '20px auto',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  header: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.1em',
  },
  notificationBanner: {
    padding: '10px',
    textAlign: 'center',
    fontSize: '0.9em',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: '15px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  messageBubbleBase: {
    maxWidth: '75%',
    padding: '10px 15px',
    borderRadius: '20px',
    wordBreak: 'break-word',
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#007bff',
    color: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '5px',
  },
  opponentMessage: {
    backgroundColor: '#e9ecef',
    color: '#333',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '5px',
  },
  senderName: {
    fontSize: '0.75em',
    fontWeight: 'bold',
    marginBottom: '3px',
    display: 'block',
  },
  messageText: {
    margin: '0',
    lineHeight: '1.4',
  },
  timestamp: {
    fontSize: '0.7em',
    color: '#777',
    display: 'block',
    marginTop: '5px',
    textAlign: 'right',
  },
  typingIndicator: {
    padding: '5px 15px',
    fontStyle: 'italic',
    fontSize: '0.85em',
    color: '#777',
  },
  inputForm: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  inputField: {
    flexGrow: 1,
    padding: '10px 15px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '10px',
    fontSize: '1em',
  },
  sendButton: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1em',
  },
};

export default CombatChat;