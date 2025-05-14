import axiosInstance from './axiosInstance';
import { Gym } from '../models/Gym';

const API_BASE_URL = 'http://localhost:9000/api';

interface GetGymsResponse {
  gyms: Gym[];
  totalGyms: number;
  totalPages: number;
  currentPage: number;
}

// Obtener todos los gimnasios con paginación
export const getGyms = async (page: number = 1, pageSize: number = 10): Promise<GetGymsResponse> => {
  const response = await axiosInstance.get<GetGymsResponse>(`${API_BASE_URL}/gym`, {
    params: { page, pageSize },
  });

  return response.data;
};

// Registrar un gimnasio
export const registerGym = async (gymData: Gym): Promise<Gym> => {
  const response = await axiosInstance.post<Gym>(`${API_BASE_URL}/gym`, gymData);
  return response.data;
};

// Obtener un gimnasio por ID
export const getGymById = async (id: string): Promise<Gym> => {
  const response = await axiosInstance.get<Gym>(`${API_BASE_URL}/gym/${id}`);
  return response.data;
};

// Actualizar un gimnasio
export const updateGym = async (id: string, updateData: Partial<Gym>): Promise<Gym> => {
  const response = await axiosInstance.put<Gym>(`${API_BASE_URL}/gym/${id}`, updateData);
  return response.data;
};

// Eliminar un gimnasio
export const deleteGym = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}/gym/${id}`);
};

// 获取当前登录的健身房信息
export const getCurrentGym = async (): Promise<Gym> => {
  const gymToken = localStorage.getItem('gymToken');
  if (!gymToken) {
    throw new Error('No gym token found');
  }

  const response = await fetch(`${API_BASE_URL}/gym/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gymToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('gymToken');
      localStorage.removeItem('userData');
      window.location.href = '/gym-login';
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch gym data');
  }

  return response.json();
};

// 更新健身房信息
export const updateGymProfile = async (gymId: string, updateData: Partial<Gym>): Promise<Gym> => {
  const gymToken = localStorage.getItem('gymToken');
  if (!gymToken) {
    throw new Error('No gym token found');
  }

  const response = await fetch(`${API_BASE_URL}/gym/${gymId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${gymToken}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    throw new Error('Failed to update gym data');
  }

  return response.json();
};