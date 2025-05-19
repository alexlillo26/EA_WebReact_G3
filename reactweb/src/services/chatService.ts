// src/hooks/useCombatChat.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  UiChatMessage,
  ServerCombatChatMessage,
  CombatChatNotification,
  OpponentTypingPayload
} from '../models/Chat'; // Ajusta la ruta si es necesario

interface UseCombatChatProps {
  combatId: string | null;        // ID de la sala de combate
  userToken: string | null;       // Token JWT del usuario actual
  currentUserId: string | null;   // ID del usuario actual
}

// URL del servidor Socket.IO. Considera usar una variable de entorno.
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:9000';

export function useCombatChat({ combatId, userToken, currentUserId }: UseCombatChatProps) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [opponentTypingInfo, setOpponentTypingInfo] = useState<{ username?: string; isTyping: boolean } | null>(null);
  const [lastNotification, setLastNotification] = useState<CombatChatNotification | null>(null);

  useEffect(() => {
    console.log('[useCombatChat] useEffect triggered. Props:', { combatId, userToken, currentUserId });

    // 1. Si faltan datos esenciales, no intentar conectar y limpiar.
    if (!combatId || !userToken || !currentUserId) {
      console.log('[useCombatChat] Missing essential props (combatId, userToken, or currentUserId). Disconnecting if active.');
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
      setMessages([]); // Limpiar mensajes
      setIsConnected(false);
      setOpponentTypingInfo(null);
      if (socketRef.current) { // Limpiar la referencia si el socket se desconectó
        socketRef.current.removeAllListeners();
        socketRef.current = null;
      }
      return;
    }

    // 2. Limpiar conexión anterior:
    // El return de useEffect se encargará de esto cuando las dependencias cambien
    // o el componente se desmonte. No obstante, si queremos ser explícitos al inicio del efecto
    // si un socket ya existe (de un render anterior con diferentes props pero dentro de la misma montura del componente padre)
    // podríamos desconectarlo aquí, pero la función de limpieza es el lugar más canónico.
    // Por ahora, confiaremos en la función de limpieza y en que un cambio en las dependencias
    // causará la limpieza antes de ejecutar este cuerpo de nuevo.

    console.log(`[useCombatChat] Attempting to establish new socket connection for combatId: ${combatId}, userId: ${currentUserId}`);

    // 3. Crear nueva instancia de socket con el token actual
    const newSocket = io(SOCKET_SERVER_URL, {
      auth: { token: userToken }, // Enviar token para autenticación del backend
      transports: ['websocket'],  // Forzar WebSockets (opcional, pero bueno para consistencia)
      // autoConnect: true, // Por defecto es true, se conectará inmediatamente
      // reconnectionAttempts: 3, // Ejemplo: intentar reconectar 3 veces
    });
    socketRef.current = newSocket; // Guardar la nueva instancia del socket

    // --- Manejadores de eventos del socket ---
    newSocket.on('connect', () => {
      console.log(`[useCombatChat] Socket connected: ${newSocket.id}. UserToken used: ${userToken ? 'Present' : 'MISSING!'}. CurrentUserId: ${currentUserId}. Joining combat: ${combatId}`);
      setIsConnected(true);
      newSocket.emit('join_combat_chat', { combatId });
    });

    newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.log(`[useCombatChat] Socket disconnected: ${newSocket.id}. Reason: ${reason}. CombatId: ${combatId}`);
      setIsConnected(false);
      setOpponentTypingInfo(null);
      // Si la desconexión fue por un error del servidor (ej. token inválido),
      // el backend podría haber cerrado la conexión.
      if (reason === 'io server disconnect') {
        // Podrías querer reintentar la conexión o limpiar el token si es un problema de autenticación.
        // newSocket.connect(); // Socket.IO podría intentar reconectar automáticamente dependiendo de la configuración.
      }
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error(`[useCombatChat] Socket connection error for ${newSocket.id}: ${err.message}. Token used: ${userToken ? 'Present' : 'MISSING!'}. CombatId: ${combatId}`);
      setIsConnected(false);
      // Podrías añadir una notificación de error para el usuario aquí.
      setLastNotification({type: 'error', message: `Error de conexión al chat: ${err.message}`});
    });

    newSocket.on('receive_combat_message', (data: ServerCombatChatMessage) => {
      // Asegurarse de que currentUserId (de las props/closure del hook) sea el correcto para este socket/sesión.
      console.log(`[useCombatChat] Message received for combatId ${data.combatId} by userId ${currentUserId}:`, data);

      if (!currentUserId) {
        console.warn('[useCombatChat] currentUserId not available when message received. Message ignored.');
        return;
      }
      if (typeof data.senderId === 'undefined') {
          console.error('[useCombatChat] Message received without senderId. Data:', data);
          return;
      }
      if (data.combatId !== combatId) { // Solo procesar mensajes para la sala actual
        console.warn(`[useCombatChat] Message received for different combatId (${data.combatId}), current is ${combatId}. Message ignored.`);
        return;
      }

      const newMessage: UiChatMessage = {
        id: `${data.senderId}-${data.timestamp}-${Math.random().toString(36).substring(7)}`,
        combatId: data.combatId,
        senderId: data.senderId,
        senderUsername: data.senderUsername,
        message: data.message,
        timestamp: data.timestamp,
        isMe: data.senderId === currentUserId, // Esta comparación es clave
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    newSocket.on('combat_chat_notification', (data: CombatChatNotification) => {
      console.log('[useCombatChat] Notification received:', data);
      setLastNotification(data);
    });

    newSocket.on('opponent_typing', (data: OpponentTypingPayload) => {
      // Asegurarse de que currentUserId (de las props/closure del hook) sea el correcto.
      if (data.userId !== currentUserId) {
        setOpponentTypingInfo({ username: data.username, isTyping: data.isTyping });
      } else {
        // Es el propio usuario escribiendo, podrías querer limpiar el opponentTypingInfo
        // si previamente había información de otro usuario.
        // O simplemente no hacer nada si solo te importa el *oponente*.
        if (opponentTypingInfo && opponentTypingInfo.isTyping) { // Si el oponente estaba escribiendo y ahora soy yo
           setOpponentTypingInfo(null); // Limpiar para evitar confusión
        }
      }
    });

    newSocket.on('combat_chat_error', (data: { message: string }) => {
        console.error('[useCombatChat] Chat-specific error from server:', data.message);
        setLastNotification({ type: 'error', message: data.message });
    });

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // o ANTES de que el efecto se ejecute de nuevo debido a un cambio en las dependencias.
    return () => {
      console.log(`[useCombatChat] Cleaning up for combatId: ${combatId}, userId: ${currentUserId}. Disconnecting socket: ${newSocket.id}`);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      // Eliminar todos los listeners para este socket específico y luego desconectar.
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('receive_combat_message');
      newSocket.off('combat_chat_notification');
      newSocket.off('opponent_typing');
      newSocket.off('combat_chat_error');
      newSocket.disconnect();

      // Si esta era la instancia actual en socketRef, limpiarla.
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
      console.log(`[useCombatChat] Cleanup complete for socket: ${newSocket.id}`);
    };
  }, [combatId, userToken, currentUserId]); // Dependencias del efecto. Si alguna cambia, se limpia y se re-ejecuta.

  const sendMessage = useCallback((messageText: string) => {
    if (socketRef.current?.connected && messageText.trim() && combatId) {
      console.log(`[useCombatChat] Sending message for combatId ${combatId}: "${messageText.trim()}" by socket ${socketRef.current.id}`);
      socketRef.current.emit('send_combat_message', {
        combatId,
        message: messageText.trim(),
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // No necesitamos emitir 'typing_in_combat' con false aquí,
      // el servidor lo manejará o la lógica de input lo hará.
    } else {
      console.warn('[useCombatChat] Cannot send message. Socket not connected or missing data.', {isConnected: socketRef.current?.connected, combatId, messageText});
      setLastNotification({type: 'error', message: 'No conectado. No se pudo enviar el mensaje.'});
    }
  }, [combatId]); // combatId es dependencia porque se usa en el payload.

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    // No es necesario 'immediate' como parámetro si el timeout se maneja aquí.
    if (socketRef.current?.connected && combatId) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit('typing_in_combat', { combatId, isTyping });

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (socketRef.current?.connected) { // Comprobar de nuevo antes de emitir
            socketRef.current.emit('typing_in_combat', { combatId, isTyping: false });
          }
        }, 2000); // 2 segundos de inactividad
      }
    }
  }, [combatId]); // combatId es dependencia.

  return { messages, sendMessage, sendTypingStatus, opponentTypingInfo, isConnected, lastNotification };
}