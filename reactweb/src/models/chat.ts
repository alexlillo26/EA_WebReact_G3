// Este archivo replica las estructuras de datos que tu backend envía al frontend.

/**
 * Representa un mensaje de chat, tal como se define en IChatMessage del backend.
 */
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  readBy: string[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/**
 * Representa la previsualización de una conversación en la lista,
 * tal como se define en PopulatedConversationPreview del backend.
 */
export interface ConversationPreview {
  _id: string;
  otherParticipant: {
    _id: string;
    name: string;
    profilePicture?: string;
  } | null;
  lastMessage?: {
    _id: string;
    message: string;
    senderId: string;
    senderUsername: string;
    createdAt: string; // ISO 8601 date string
  };
  updatedAt: string; // ISO 8601 date string
  unreadCount: number;
}

/**
 * Representa la respuesta paginada de la API para las conversaciones.
 */
export interface ConversationsResponse {
    conversations: ConversationPreview[];
    totalConversations: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Representa la respuesta paginada de la API para los mensajes.
 */
export interface MessagesResponse {
    messages: ChatMessage[];
    totalMessages: number;
    totalPages: number;
    currentPage: number;
}