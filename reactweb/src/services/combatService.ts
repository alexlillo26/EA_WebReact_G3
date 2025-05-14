import { Combat } from '../models/Combat';

const API_BASE_URL = 'http://localhost:9000/api';

// Obtener todos los combates con paginación
export const getCombats = async (page: number = 1, pageSize: number = 10): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await fetch(`${API_BASE_URL}/combat?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los combates');
  }

  return response.json();
};

// Registrar un combate
export const registerCombat = async (combatData: Combat): Promise<Combat> => {
  try {
    const response = await fetch(`${API_BASE_URL}/combat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(combatData),
    });

    if (!response.ok) {
      throw new Error('Error al registrar el combate');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al registrar el combate:", error.message);
    } else {
      console.error("Error al registrar el combate:", error);
    }
    throw error;
  }
};

// Get combats for a specific gym with pagination
export const getGymCombats = async (gymId: string, page: number = 1, pageSize: number = 10): Promise<{ combats: Combat[]; totalCombats: number; totalPages: number; currentPage: number }> => {
  const response = await fetch(`${API_BASE_URL}/combat/gym/${gymId}?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('gymToken')}`
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los combates del gimnasio');
  }

  return response.json();
};