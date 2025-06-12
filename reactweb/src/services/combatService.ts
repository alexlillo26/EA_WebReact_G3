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
  const response = await axiosInstance.get<any>('/api/combat', { params });
  return response.data as { combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number };
};

// Crear un nuevo combate
export const createCombat = async (combatData: Partial<Combat> | FormData) => {
  if (combatData instanceof FormData) {
    const response = await axiosInstance.post<any>('/api/combat', combatData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else{
    const response = await axiosInstance.post<any>('/api/combat', combatData);
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

  await axiosInstance.put<any>(
    `/api/combat/${combatId}/image`, // Asegúrate de tener este endpoint en el backend
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

export const cancelCombatService = async (combatId: string, reason: string) => {
  const response = await axiosInstance.post(`/api/combat/${combatId}/cancel`, { reason });
  return response.data;
};
