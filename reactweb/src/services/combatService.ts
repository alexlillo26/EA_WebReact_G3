// Tus imports existentes
import { Combat } from '../models/Combat';
import axiosInstance from './axiosInstance';
import { CombatHistoryEntry, CombatHistoryApiResponse } from '../models/Combat';

export interface FetchCombatHistoryReturn {
  combats: CombatHistoryEntry[];
  totalCombats: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// === TUS FUNCIONES EXISTENTES (sin cambios) ===
export const getCombats = async (params: Record<string, any> = {}): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await axiosInstance.get<any>('/api/combat', { params });
  return response.data as { combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number };
};

export const createCombat = async (combatData: Partial<Combat>) => {
  const response = await axiosInstance.post<any>('/api/combat', combatData);
  return response.data;
};

export const respondCombat = async (combatId: string, status: 'accepted' | 'rejected') => {
  const response = await axiosInstance.patch<any>(`/api/combat/${combatId}/respond`, { status });
  return response.data;
};

export const fetchInvitations = async () => {
  return axiosInstance.get<any>('/api/combat/invitations');
};

export const fetchFutureCombats = async () => {
  return axiosInstance.get<any>('/api/combat/future');
};

export const fetchSentInvitations = async () => {
  return axiosInstance.get<any>('/api/combat/sent-invitations');
};

export const getGymCombats = async (gymId: string, page: number = 1, pageSize: number = 10): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await axiosInstance.get<any>(`/api/combat/gym/${gymId}`, { params: { page, pageSize } });
  return response.data as { combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number };
};

export const fetchCombatHistory = async (
    boxerId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<FetchCombatHistoryReturn> => {
    const url = `/api/combat/history/user/${boxerId}`;
    const response = await axiosInstance.get<CombatHistoryApiResponse>(url, {
        params: { page, pageSize }
    });
    return response.data.data;
};

// === CAMBIO: NUEVA FUNCIÓN AÑADIDA ===
/**
 * Llama al endpoint del backend para establecer el ganador de un combate.
 * @param combatId - El ID del combate a actualizar.
 * @param winnerId - El ID del boxeador que ha ganado.
 * @returns El objeto del combate actualizado devuelto por el backend.
 */
export const setCombatResult = async (combatId: string, winnerId: string) => {
  const url = `/api/combats/${combatId}/result`;
  const response = await axiosInstance.post(url, { winnerId });
  return response.data;
};