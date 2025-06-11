import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';
import { Gym } from '../models/Gym';

interface GetGymsResponse {
  gyms: Gym[];
  totalGyms: number;
  totalPages: number;
  currentPage: number;
}

// Obtener todos los gimnasios con paginación
export const getGyms = async (page: number = 1, pageSize: number = 10): Promise<GetGymsResponse> => {
  const response = await axiosInstance.get<GetGymsResponse>(`${API_BASE_URL}/api/gym`, {
    params: { page, pageSize },
  });

  return response.data;
};

// Registrar un gimnasio
export const registerGym = async (gymData: Gym): Promise<Gym> => {
  const response = await axiosInstance.post<Gym>(`${API_BASE_URL}/api/gym`, gymData);
  return response.data;
};

// Obtener un gimnasio por ID
export const getGymById = async (id: string): Promise<Gym> => {
  const response = await axiosInstance.get<Gym>(`${API_BASE_URL}/api/gym/${id}`);
  return response.data;
};

// Actualizar un gimnasio
export const updateGym = async (id: string, updateData: Partial<Gym>): Promise<Gym> => {
  const response = await axiosInstance.put<Gym>(`${API_BASE_URL}/api/gym/${id}`, updateData);
  return response.data;
};

// Eliminar un gimnasio
export const deleteGym = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}/api/gym/${id}`);
};

// Obtener información sobre el gimnasio conectado actualmente
export const getCurrentGym = async (): Promise<Gym> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/gym/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/gym-login';
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch gym data');
  }

  return response.json();
};

// Update gym profile
export const updateGymProfile = async (gymId: string, updateData: Partial<Gym>): Promise<Gym> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/gym/${gymId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    throw new Error('Failed to update gym data');
  }

  return response.json();
};

export const updateGymPhotos = async (
  gymId: string,
  formData: FormData
): Promise<Gym> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/gym/${gymId}/photos`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // No pongas 'Content-Type', fetch lo gestiona con FormData
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to update gym photos');
  }

  return response.json();
};