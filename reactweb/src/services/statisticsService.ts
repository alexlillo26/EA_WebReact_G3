import axiosInstance from './axiosInstance';
import { IUserStatistics } from '../models/Combat'; // Importamos el tipo que creamos

/**
 * Obtiene las estadísticas de combate para un usuario desde la API.
 * @param boxerId El ID del usuario.
 * @returns Las estadísticas del usuario.
 */
export const fetchUserStatistics = async (boxerId: string): Promise<IUserStatistics> => {
  // La URL coincide con la nueva ruta que creamos en el backend
  const response = await axiosInstance.get(`/api/combat/statistics/user/${boxerId}`);
  return response.data as IUserStatistics;
};