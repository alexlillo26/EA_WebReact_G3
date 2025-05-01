import { Usuario } from '../models/Usuario';
import { getToken } from './authService';


// Definir las rutas de la API
const API_BASE_URL = 'http://localhost:9000/api'; // Asegúrate de que coincida con el backend
const LOGIN_URL = `${API_BASE_URL}/users/login`; // Cambiar a /users/login
const REGISTER_URL = `${API_BASE_URL}/users/register`; // Cambiar a /users/register
const GET_USER_BY_ID_URL = (id: string) => `${API_BASE_URL}/users/${id}`; // Cambiar a /users/:id

// Servicio para iniciar sesión
export const loginUser = async (email: string, password: string): Promise<{ name: string } | null> => {
  try {
    const response = await fetch('http://localhost:9000/api/users/login', {
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
    const response = await fetch(GET_USER_BY_ID_URL(id), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el usuario");
    }

    const user: Usuario = await response.json();
    return user;
  } catch (error) {
    console.error("Error en getUserById:", error);
    return null;
  }
};

// Servicio para actualizar un usuario
export const updateUser = async (id: string, updateData: Partial<Usuario>): Promise<Usuario | null> => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token available");

    const response = await fetch(GET_USER_BY_ID_URL(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario");
    }

    const updatedUser: Usuario = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Error en updateUser:", error);
    return null;
  }
};