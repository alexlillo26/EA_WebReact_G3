import { Rating } from '../models/Rating';
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';

// Endpoints
const CREATE_RATING_URL = `${API_BASE_URL}/ratings`;
const GET_RATINGS_BY_USER_URL = (userId: string) => `${API_BASE_URL}/ratings?to=${userId}`;
const GET_RATING_FROM_TO_URL = (fromId: string, toId: string) => `${API_BASE_URL}/ratings?from=${fromId}&to=${toId}`;

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

// Obtener todas las calificaciones recibidas por un usuario (boxeador)
export const getRatingsByUser = async (userId: string): Promise<Rating[]> => {
  try {
    const response = await axiosInstance.get<{ ratings: Rating[] }>(GET_RATINGS_BY_USER_URL(userId));
    // Si tu backend devuelve un array directo, usa: response.data
    return response.data.ratings || [];
  } catch (error) {
    console.error("Error en getRatingsByUser:", error);
    return [];
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