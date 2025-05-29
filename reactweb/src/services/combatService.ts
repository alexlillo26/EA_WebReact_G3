import { Combat } from '../models/Combat';
import axiosInstance from './axiosInstance';

// Obtener todos los combates con filtros (params)
export const getCombats = async (params: Record<string, any> = {}): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
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

// Responder a una invitación de combate (aceptar o rechazar)
export const respondCombat = async (combatId: string, status: 'accepted' | 'rejected') => {
  const response = await axiosInstance.patch<any>(`/combat/${combatId}/respond`, { status });
  return response.data;
};

// Obtener invitaciones de combate recibidas
export const fetchInvitations = async () => {
  return axiosInstance.get('/combat/invitations');
};

// Obtener combates futuros
export const fetchFutureCombats = async () => {
  return axiosInstance.get('/combat/future');
};

// Obtener invitaciones de combate enviadas
export const fetchSentInvitations = async () => {
  return axiosInstance.get('/combat/sent-invitations');
};

// Obtener combates de un gimnasio con paginación
export const getGymCombats = async (gymId: string, page: number = 1, pageSize: number = 10): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await axiosInstance.get<any>(`/combat/gym/${gymId}`, { params: { page, pageSize } });
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
  return response.data;
};