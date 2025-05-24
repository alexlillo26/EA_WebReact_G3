import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';
import { Combat } from '../models/Combat';

// Esta función obtiene los combates de un boxeador con paginación
export const getCombatsByBoxer = async (
    boxerId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
    const url = `${API_BASE_URL}/combat/boxer/${boxerId}`;
    try {
        const response = await axiosInstance.get<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }>(url, { params: { page, pageSize } });
        return response.data;
    } catch (error) {
        console.error('Error en getCombatsByBoxer:', error);
        throw error;
    }
};