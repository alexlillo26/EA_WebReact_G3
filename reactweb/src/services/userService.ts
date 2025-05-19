// src/services/userService.ts

import { Usuario } from '../models/Usuario'; // Tu modelo de usuario del frontend
import { getToken } from './authService';
import axiosInstance from './axiosInstance'; // Tu instancia configurada de Axios

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';
const REGISTER_URL = `${API_BASE_URL}/users/register`;
const GET_USER_BY_ID_URL = (id: string) => `${API_BASE_URL}/users/${id}`;
const LOGIN_URL = `${API_BASE_URL}/users/login`;
const SEARCH_USERS_URL = `${API_BASE_URL}/users/search`;

export interface LoginResponsePayload {
  token: string;
  refreshToken?: string;
  userId: string;
  username: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponsePayload | null> => {
  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) { /* No hacer nada */ }
      throw new Error(errorMessage);
    }
    const data: LoginResponsePayload = await response.json();
    if (!data.token || !data.userId || !data.username) {
      console.error("Login response from backend is missing essential fields:", data);
      throw new Error("Respuesta de login incompleta del servidor.");
    }
    return data;
  } catch (error) {
    console.error('Error en loginUser:', error);
    return null;
  }
};

export const registerUser = async (userData: Omit<Usuario, 'id' | 'isHidden'>): Promise<Usuario | null> => {
  try {
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Error al registrar usuario: ${errorDetails.message || response.statusText}`);
    }
    // Asumimos que el backend devuelve el usuario con 'id' después del mapeo que hiciste allí.
    return await response.json();
  } catch (error) {
    console.error("Error en registerUser:", error);
    return null;
  }
};

export const getUserById = async (): Promise<Usuario | null> => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token available");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userIdFromToken = payload.id;
    if (!userIdFromToken) throw new Error("No se pudo extraer el ID del token");
    const response = await axiosInstance.get<Usuario>(GET_USER_BY_ID_URL(userIdFromToken));
    // Asumimos que el backend devuelve el usuario con 'id'.
    return response.data;
  } catch (error) {
    console.error("Error en getUserById:", error);
    return null;
  }
};

export const updateUser = async (id: string, updateData: Partial<Usuario> | FormData): Promise<Usuario | null> => {
  try {
    const isFormData = updateData instanceof FormData;
    const response = await axiosInstance.put<Usuario>(GET_USER_BY_ID_URL(id), updateData, {
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
    // Asumimos que el backend devuelve el usuario con 'id'.
    return response.data;
  } catch (error) {
    console.error("Error en updateUser:", error);
    return null;
  }
};

// Interfaz para el usuario COMO VIENE DEL BACKEND en la búsqueda
// Ahora espera 'id' porque el backend ya lo mapeó.
interface BackendUserFromSearch {
  id: string; // <--- CAMBIO IMPORTANTE: Espera 'id'
  name: string;
  birthDate: string;
  email?: string; // Marcar como opcional si no siempre viene o no es crucial para 'Usuario'
  phone?: string; // Marcar como opcional
  weight: string;
  city: string;
  gender?: string; // Marcar como opcional
  profilePicture?: string | null;
  level?: string; // Si tu backend lo envía
}

export const searchUsers = async (city?: string, weight?: string, level?: string): Promise<Usuario[]> => {
  try {
    const params: Record<string, string | undefined> = {}; // Permitir undefined para level
    if (city) params.city = city;
    if (weight) params.weight = weight;
    if (level) params.level = level; // Incluir level en los parámetros si se proporciona

    // Asegúrate de que la estructura esperada de la respuesta sea correcta.
    // Si el backend devuelve { success: true, count: number, users: BackendUserFromSearch[] }
    const response = await axiosInstance.get<{ success: boolean, count: number, users: BackendUserFromSearch[] }>(SEARCH_USERS_URL, { params });

    console.log('[FRONTEND userService] Search results (raw from backend):', response.data);

    if (response.data && Array.isArray(response.data.users)) {
      const frontendUsers: Usuario[] = response.data.users.map(backendUser => {
        // El objeto backendUser ya tiene una propiedad 'id' (string) gracias al mapeo del backend.
        const userForFrontend: Usuario = {
          id: backendUser.id, // <--- CORRECCIÓN: Usa backendUser.id directamente
          name: backendUser.name,
          birthDate: new Date(backendUser.birthDate), // Asegúrate de que Usuario espera Date
          email: backendUser.email || '', // Provee un fallback si es undefined y Usuario espera string
          phone: backendUser.phone || '', // Provee un fallback
          weight: backendUser.weight,
          city: backendUser.city,
          gender: backendUser.gender || '', // Provee un fallback
          profilePicture: backendUser.profilePicture ?? undefined,
          // Asegúrate de que todos los campos requeridos por tu interfaz 'Usuario' estén aquí.
          // Campos como password, confirmPassword, isHidden que no vienen del search
          // serán undefined si son opcionales en 'Usuario', lo cual está bien.
        };
        
        return userForFrontend;
      });
      console.log('[FRONTEND userService] Search results (mapped to frontend Usuario):', frontendUsers);
      return frontendUsers;
    }
    return [];
  } catch (error) {
    console.error('Error en frontend userService searchUsers:', error);
    throw error; // Relanzar para que el componente lo maneje
  }
};