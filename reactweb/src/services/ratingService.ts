import { Rating } from '../models/Rating';
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';

// Endpoints
const CREATE_RATING_URL = `${API_BASE_URL}/api/ratings`;
const GET_RATING_FROM_TO_URL = (fromId: string, toId: string) => `${API_BASE_URL}/api/ratings?from=${fromId}&to=${toId}`;

// Crear una calificación (puntuar a un boxeador)
export const createRating = async (data: Omit<Rating, '_id' | 'createdAt'>): Promise<Rating | null> => {
  try {
    console.log("Llamando a POST /ratings con:", data);
    const response = await axiosInstance.post<Rating>(CREATE_RATING_URL, data);
    console.log("Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error en createRating:", error);
    return null;
  }
};

// Obtener la calificación que un usuario ha dado a otro (si existe)
export const getRatingFromTo = async (fromId: string, toId: string): Promise<Rating | null> => {
  try {
    const response = await axiosInstance.get<Rating[]>(GET_RATING_FROM_TO_URL(fromId, toId));
    // Si tu backend devuelve un array, toma el primero (solo puede haber una)
    return response.data[0] || null;
  } catch (error) {
    console.error("Error en getRatingFromTo:", error);
    return null;
  }
};

export const getRatingsByUser = async (userId: string): Promise<Rating[]> => {
  try {
    const url = `${API_BASE_URL}/api/ratings/user/${userId}`;
    const response = await axiosInstance.get<Rating[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener ratings para el usuario:", error);
    return [];
  }
};