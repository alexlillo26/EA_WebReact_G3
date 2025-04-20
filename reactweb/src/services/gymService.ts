import { Gym } from '../models/Gym';

const API_BASE_URL = 'http://localhost:9000/api';

// Obtener todos los gimnasios con paginación
export const getGyms = async (page: number = 1, pageSize: number = 10): Promise<{ gyms: Gym[]; totalGyms: number; totalPages: number; currentPage: number }> => {
  const response = await fetch(`${API_BASE_URL}/gym?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Error al obtener los gimnasios');
  }

  return response.json();
};

// Registrar un gimnasio
export const registerGym = async (gymData: Gym): Promise<Gym> => {
  const response = await fetch(`${API_BASE_URL}/gym`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gymData),
  });

  if (!response.ok) {
    throw new Error('Error al registrar el gimnasio');
  }

  return response.json();
};

// Obtener un gimnasio por ID
export const getGymById = async (id: string): Promise<Gym> => {
  const response = await fetch(`${API_BASE_URL}/gym/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el gimnasio');
  }

  return response.json();
};

// Actualizar un gimnasio
export const updateGym = async (id: string, updateData: Partial<Gym>): Promise<Gym> => {
  const response = await fetch(`${API_BASE_URL}/gym/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el gimnasio');
  }

  return response.json();
};

// Eliminar un gimnasio
export const deleteGym = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/gym/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el gimnasio');
  }
};