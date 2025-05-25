import { Usuario } from '../models/Usuario';
import { getToken } from './authService';
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';

const REGISTER_URL = `${API_BASE_URL}/users/register`; // Cambiar a /users/register
const GET_USER_BY_ID_URL = (id: string) => `${API_BASE_URL}/users/${id}`; // Cambiar a /users/:id

// Servicio para iniciar sesión
export const loginUser = async (email: string, password: string): Promise<{ name: string } | null> => {
  try {
    const response = await fetch('https://ea3-api.upc.edu/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Error al iniciar sesión');
    }

    const data = await response.json();
    console.log('Respuesta del backend:', data); // Depuración
    return data.user; // Extraer el objeto `user` de la respuesta
  } catch (error) {
    console.error('Error en loginUser:', error);
    return null;
  }
};
// Servicio para registrar un nuevo usuario
export const registerUser = async (userData: Omit<Usuario, 'id' | 'isHidden'>): Promise<Usuario | null> => {
  try {
    console.log("Sending registration data:", userData); // Log the payload
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorDetails = await response.json(); // Parse error response
      console.error("Backend error details:", errorDetails); // Log backend error
      throw new Error(`Error al registrar usuario: ${errorDetails.message || response.statusText}`);
    }

    const user: Usuario = await response.json();
    return user;
  } catch (error) {
    console.error("Error en registerUser:", error);
    return null;
  }
};

// Servicio para obtener un usuario por ID
export const getUserById = async (): Promise<Usuario | null> => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token available");

    const { id } = JSON.parse(atob(token.split(".")[1])); // Decode token payload
    const response = await axiosInstance.get<Usuario>(GET_USER_BY_ID_URL(id));
    return response.data;
  } catch (error) {
    console.error("Error en getUserById:", error);
    return null;
  }
};

// Servicio para actualizar un usuario
export const updateUser = async (id: string, updateData: Partial<Usuario> | FormData): Promise<Usuario | null> => {
  try {
    const isFormData = updateData instanceof FormData; // Check if updateData is FormData
    const response = await axiosInstance.put<Usuario>(GET_USER_BY_ID_URL(id), updateData, {
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    });
    console.log("Usuario actualizado:", response.data); // Log the updated user
    return response.data;
  } catch (error) {
    console.error("Error en updateUser:", error);
    return null;
  }
};

// Servicio para buscar usuarios
export const searchUsers = async (city?: string, weight?: string): Promise<any[]> => {
  try {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (weight) params.weight = weight;

    const response = await axiosInstance.get<{ users: any[] }>(`${API_BASE_URL}/users/search`, { params });
    console.log('Search results:', response.data); // Debug log
    return response.data.users || [];
  } catch (error) {
    console.error('Error en searchUsers:', error);
    throw error;
  }
};