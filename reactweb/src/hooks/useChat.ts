import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { getConversationMessages } from '../services/chatApi';
import { ChatMessage } from '../models/chat';

// Tipo para el payload del evento de socket 'new_message' que se recibe del backend
interface NewMessagePayload {
  conversationId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

// Tipo para el payload del evento de socket 'opponent_typing'
interface TypingPayload {
  conversationId: string;
  userId: string;
  username:string;
  isTyping: boolean;
}

export const useChat = (conversationId: string | null) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [opponentIsTyping, setOpponentIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Efecto principal para manejar la conexión y los listeners del chat
  useEffect(() => {
    // No hacer nada si no tenemos el socket o una conversación seleccionada
    if (!socket || !conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);

    // 1. Unirse a la "sala" de la conversación en el backend
    socket.emit('join_chat_room', { conversationId });

    // 2. Cargar el historial de mensajes desde la API
    getConversationMessages(conversationId)
      .then(data => {
        setMessages(data.messages);
      })
      .catch(error => console.error("Error al cargar mensajes:", error))
      .finally(() => setLoading(false));

    // 3. Listener para recibir nuevos mensajes en tiempo real
    const handleNewMessage = (newMessagePayload: NewMessagePayload) => {
      if (newMessagePayload.conversationId === conversationId) {
        const formattedMessage: ChatMessage = {
          _id: new Date().toISOString(), // ID temporal para la key de React
          conversationId: newMessagePayload.conversationId,
          senderId: newMessagePayload.senderId,
          senderUsername: newMessagePayload.senderUsername,
          message: newMessagePayload.message,
          createdAt: newMessagePayload.timestamp,
          updatedAt: newMessagePayload.timestamp,
          readBy: []
        };
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    };

    // 4. Listener para saber si el oponente está escribiendo
    const handleOpponentTyping = (payload: TypingPayload) => {
      if (payload.conversationId === conversationId) {
        setOpponentIsTyping(payload.isTyping);
        setTypingUser(payload.isTyping ? payload.username : null);
      }
    };

    // Suscribimos los listeners
    socket.on('new_message', handleNewMessage);
    socket.on('opponent_typing', handleOpponentTyping);

    // 5. Función de limpieza: se desuscribe de los eventos para evitar fugas de memoria
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('opponent_typing', handleOpponentTyping);
    };
  }, [socket, conversationId]); // Se ejecuta de nuevo si cambia el socket o la conversación

  /**
   * Envía un mensaje a través del socket.
   * Se usa useCallback para optimizar y evitar que la función se recree innecesariamente.
   */
  const sendMessage = useCallback((message: string) => {
    // Se asegura de que tenemos todo lo necesario antes de emitir
    if (socket && conversationId && message.trim()) {
      socket.emit('send_message', { 
        conversationId, 
        message: message.trim() 
      });
    }
  }, [socket, conversationId]);

  /**
   * Notifica al backend si el usuario está escribiendo o ha dejado de hacerlo.
   */
  const notifyTyping = useCallback((isTyping: boolean) => {
    if (socket && conversationId) {
        const event = isTyping ? 'typing_started' : 'typing_stopped';
        socket.emit(event, { conversationId });
    }
  }, [socket, conversationId]);

  // Devolvemos el estado y las funciones que los componentes utilizarán
  return { messages, loading, sendMessage, opponentIsTyping, typingUser, notifyTyping };
};