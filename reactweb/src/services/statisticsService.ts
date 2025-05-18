import axiosInstance from './axiosInstance';

const API_BASE_URL = 'http://ea3-api.upc.edu/api';

export interface Combat {
    id: string;
    date: string;
    gym: {
        id: string;
        name: string;
    };
    boxers: {
        id: string;
        name: string;
    }[];
    isHidden: boolean;
}

// Esta función obtiene los combates de un boxeador con paginación
export const getCombatsByBoxer = async (
    boxerId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {

    const url = `${API_BASE_URL}/combat/boxer/${boxerId}`;
    console.log('Calling API with URL:', url); // Debug

    try {
        const response = await axiosInstance.get<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }>(url, { params: { page, pageSize } });
        console.log('API response data:', response.data); // Debug
        return response.data;
    } catch (error) {
        console.error('Error en getCombatsByBoxer:', error);
        throw error;
    }
};