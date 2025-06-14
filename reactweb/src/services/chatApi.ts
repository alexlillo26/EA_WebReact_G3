import { ConversationsResponse, MessagesResponse } from '../models/chat';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

// Función auxiliar para obtener el token
const getToken = (): string | null => {
    // 👇 ¡AQUÍ ESTÁ LA CORRECCIÓN!
    // Usamos 'token' para que coincida con cómo lo guarda tu authService.ts.
    // Antes probablemente decía 'authToken'.
    return localStorage.getItem('token'); 
};

/**
 * Inicia o recupera una conversación con otro usuario.
 */
export const initiateChat = async (opponentId: string): Promise<string> => {
    const token = getToken(); // Ahora esta línea obtendrá el token correcto

    if (!token) {
        // Si por alguna razón no hay token, lanzamos un error antes de llamar a la API.
        throw new Error('No se encontró token de autenticación. Por favor, inicie sesión de nuevo.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/initiate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Aquí se enviará el token real
        },
        body: JSON.stringify({ opponentId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        // El backend devuelve 'Unauthorized' como mensaje en el error 401
        throw new Error(errorData.message || 'Error al iniciar la conversación');
    }

    const data = await response.json();
    return data.conversationId;
};

/**
 * Obtiene la lista de conversaciones del usuario.
 */
export const getMyConversations = async (): Promise<ConversationsResponse> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las conversaciones');
    }

    return response.json();
};

/**
 * Obtiene los mensajes de una conversación específica.
 */
export const getConversationMessages = async (conversationId: string): Promise<MessagesResponse> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los mensajes');
    }

    return response.json();
};