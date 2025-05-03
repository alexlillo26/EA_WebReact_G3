const API_BASE_URL = 'http://localhost:9000/api';

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
    const mikeTysonId = '681646e81c856dc8e4fe0431'; // ID de Mike Tyson en MongoDB

    const url = `${API_BASE_URL}/combat/boxer/${mikeTysonId}?page=${page}&pageSize=${pageSize}`;
    console.log('Calling API with URL:', url); // Debug
    console.log('Calling API with URL:', url); // Debug
    console.log(`Fetching from: ${url}`);
    console.log('Boxer ID:', boxerId); // Debug

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('API response status:', response.status); // Debug

        if (!response.ok) {
            throw new Error(`Error al obtener los combates del boxeador: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response data:', data); // Debug

        return data;
    } catch (error) {
        console.error('Error en getCombatsByBoxer:', error);
        throw error;
    }
};