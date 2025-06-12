import axiosInstance from './axiosInstance';
import { IUserStatistics } from '../models/Combat';

/**
 * Obtiene las estadísticas de combate para un usuario desde la API.
 * @param boxerId El ID del usuario.
 * @returns Las estadísticas del usuario.
 */
export const fetchUserStatistics = async (boxerId: string): Promise<IUserStatistics> => {
  // Ajusta la ruta según tu backend
  const response = await axiosInstance.get(`/api/users/${boxerId}/statistics`);
  return response.data as IUserStatistics;
};