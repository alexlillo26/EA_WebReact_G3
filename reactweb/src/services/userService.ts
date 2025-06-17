import { Usuario } from '../models/Usuario';
import { getToken } from './authService';
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './apiConfig';

const REGISTER_URL = `${API_BASE_URL}/api/users/register`; // Cambiar a /users/register
const GET_USER_BY_ID_URL = (id: string) => `${API_BASE_URL}/api/users/${id}`; // Cambiar a /users/:id

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
export const getUserById = async (userId: string): Promise<Usuario | null> => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token available");

    const response = await axiosInstance.get<Usuario>(GET_USER_BY_ID_URL(userId));
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
export const searchUsers = async (
  city?: string,
  weight?: string
): Promise<any[]> => {
  try {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (weight) params.weight = weight;

    const response = await axiosInstance.get<{ users: any[] }>(
      `${API_BASE_URL}/api/users/search`,
      { params }
    );
    console.log("Search results:", response.data.users);
    // Filtra usuarios ocultos
    return (response.data.users || []).filter(u => !u.isHidden);
  } catch (error) {
    console.error("Error en searchUsers:", error);
    throw error;
  }
};

// Servicio explícito para subir avatar a Cloudinary vía backend
export const uploadAvatar = async (file: File) => {
  const userData = localStorage.getItem("userData");
  if (!userData) throw new Error("No user data");
  // const { id } = JSON.parse(userData); // Ya no se usa el id aquí
  const form = new FormData();
  form.append("avatar", file);
  return axiosInstance.put(
    `${API_BASE_URL}/api/users/me/avatar`,
    form
  );
};

// Servicio explícito para subir vídeo de boxeo a Cloudinary vía backend
export const uploadBoxingVideo = (
  userId: string,
  file: File,
  onProgress: (percent: number) => void
) => {
  return new Promise<any>((resolve, reject) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${API_BASE_URL}/api/users/${userId}/boxing-video`, true);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(xhr.responseText || 'Error al subir el video');
      }
    };

    xhr.onerror = () => reject('Error al subir el video');
    xhr.send(formData);
  });
};