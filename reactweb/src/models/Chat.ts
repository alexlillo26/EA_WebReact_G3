
/**
 * Interfaz para el payload que el servidor envía cuando se recibe un mensaje.
 * El campo 'senderId' es crucial y debe ser enviado por el servidor.
 */
export interface ServerCombatChatMessage {
  combatId: string;
  senderId: string;       // Enviado por el servidor (ID del remitente del token)
  senderUsername?: string; // Enviado por el servidor (username del remitente del token)
  message: string;
  timestamp: string;      // Formato ISO string
}

/**
 * Interfaz para el mensaje tal como se maneja y muestra en la UI de React.
 * Incluye 'isMe' para determinar la alineación/estilo del mensaje.
 * Incluye un 'id' local opcional para la prop 'key' de React.
 */
export interface UiChatMessage {
  id: string; // ID único para la key de React (se puede generar en el cliente)
  combatId: string;
  senderId: string;
  senderUsername?: string;
  message: string;
  timestamp: string; // Se mantiene como string, se puede formatear en la UI
  isMe: boolean;
}

/**
 * Interfaz para las notificaciones generales del chat enviadas por el servidor.
 */
export interface CombatChatNotification {
  type: 'info' | 'error' | 'success';
  message: string;
}

/**
 * Interfaz para el payload del evento 'opponent_typing' enviado por el servidor.
 */
export interface OpponentTypingPayload {
  userId: string;
  username?: string;
  isTyping: boolean;
}