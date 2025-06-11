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

// Obtener todos los combates con filtros (params)
export const getCombats = async (
  params: { [key: string]: any } = {}
): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await axiosInstance.get<any>('/combat', { params });
  return response.data as { combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number };
};

// Crear un nuevo combate
export const createCombat = async (combatData: Partial<Combat> | FormData) => {
  if (combatData instanceof FormData) {
    const response = await axiosInstance.post<any>('/combat', combatData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else{
    const response = await axiosInstance.post<any>('/combat', combatData);
    return response.data;
  }
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


export const updateCombatImage = async (combatId: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axiosInstance.put<any>(
    `/combat/${combatId}/image`, // Asegúrate de tener este endpoint en el backend
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
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