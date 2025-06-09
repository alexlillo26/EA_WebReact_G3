// Tus imports existentes
import { Combat } from '../models/Combat';
import axiosInstance from './axiosInstance';

// --- IMPORTA LOS NUEVOS TIPOS DEL PASO 1 ---
// Asegúrate de que estas interfaces (CombatHistoryEntry, CombatHistoryApiResponse)
// estén definidas en tu archivo '../models/Combat.ts'
import { CombatHistoryEntry, CombatHistoryApiResponse } from '../models/Combat';
// No necesitamos importar 'axios' y 'AxiosError' aquí si no manejamos el error en el servicio.

// --- Interfaz para el valor de retorno (buena práctica mantenerla para claridad en el componente) ---
export interface FetchCombatHistoryReturn {
  combats: CombatHistoryEntry[];
  totalCombats: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// === TUS FUNCIONES EXISTENTES (sin cambios) ===
// ... (getCombats, createCombat, etc.) ...
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


// === NUEVA FUNCIÓN PARA EL HISTORIAL DE COMBATES (VERSIÓN CONCISA) ===
export const fetchCombatHistory = async (
    boxerId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<FetchCombatHistoryReturn> => { // Mantenemos el tipo de retorno específico para ayudar al componente
    const url = `/api/combat/history/user/${boxerId}`; // Asumiendo que axiosInstance maneja la URL base y el /api si es global

    // Hacemos la petición GET, esperando una respuesta que coincida con CombatHistoryApiResponse
    // El componente que llame a esta función deberá manejar los errores con try/catch
    const response = await axiosInstance.get<CombatHistoryApiResponse>(url, {
        params: { page, pageSize }
    });
    // Devolvemos directamente el contenido de 'response.data.data'
    return response.data.data;
};