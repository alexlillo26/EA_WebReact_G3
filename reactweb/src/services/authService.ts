// src/services/authService.ts (RECOMENDADO)
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

// Interfaz para la respuesta COMPLETA de tu API de login
interface ApiLoginResponse {
  token: string;
  refreshToken?: string;
  userId: string;
  username: string;
  message?: string;
}

// Interfaz para lo que la función login del servicio devolverá al componente Login.tsx
export interface LoginServiceData {
  id: string;
  name: string;
  // token: string; // El componente Login no necesita el token directamente si ya está guardado
}

// --- Funciones de localStorage consistentes ---
export const storeAuthData = (data: ApiLoginResponse): void => {
  localStorage.setItem("token", data.token);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username); // Guardar username
  console.log("[authService] Auth data stored:", { userId: data.userId, username: data.username });
};

export const clearAuthData = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username"); // Borrar username
  // localStorage.removeItem("userData"); // Si usabas esto para Google, también bórralo
  console.log("[authService] Auth data cleared.");
};

export const getToken = (): string | null => localStorage.getItem("token");
export const getUserId = (): string | null => localStorage.getItem("userId");
export const getUsername = (): string | null => localStorage.getItem("username");
export const getRefreshToken = (): string | null => localStorage.getItem("refreshToken");

export const getCurrentUser = (): { id: string; name: string; token: string } | null => {
  const token = getToken();
  const id = getUserId();
  const name = getUsername();
  if (token && id && name) {
    return { token, id, name };
  }
  return null;
};

// --- Función de Login Principal ---
export const login = async (email: string, password: string): Promise<LoginServiceData> => {
  try {
    const response = await axios.post<ApiLoginResponse>(`${API_BASE_URL}/users/login`, { email, password });
    const data = response.data;

    if (!data.token || !data.userId || !data.username) {
      throw new Error('Respuesta de login incompleta del servidor.');
    }

    storeAuthData(data); // Guardar toda la información

    return {
      id: data.userId,
      name: data.username,
    };
  } catch (error: any) {
    console.error("Error en el servicio de login:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión.');
  }
};

// --- Función de Logout Principal ---
export const logout = (): void => {
  clearAuthData(); // Limpia todos los datos relevantes
  // La redirección se maneja mejor en el componente que llama a logout (ej. App.tsx o Navbar)
  // window.location.href = "/login";
};

// --- handleGoogleOAuth (Revisado para consistencia) ---
export const handleGoogleOAuth = async (code: string): Promise<LoginServiceData> => {
  try {
    // Asume que tu backend /auth/google devuelve una estructura similar a ApiLoginResponse
    // (token, userId, username) después de procesar el código de Google.
    // Si no devuelve userId/username, tu backend /auth/google necesita ser ajustado
    // o necesitarías otra llamada para obtener los datos del usuario usando el token.
    const response = await axios.post<ApiLoginResponse>(`${API_BASE_URL}/auth/google`, { code });
    const data = response.data;

    if (!data.token || !data.userId || !data.username) {
      // Si el backend de Google OAuth no devuelve userId/username directamente:
      // const decoded = JSON.parse(atob(data.token.split('.')[1]));
      // data.userId = decoded.id;
      // data.username = decoded.username;
      // if (!data.userId || !data.username) throw new Error('No se pudo obtener info del usuario tras Google OAuth.');
      throw new Error('Respuesta de Google OAuth incompleta del servidor.');
    }

    storeAuthData(data); // Guardar de forma consistente

    return { id: data.userId, name: data.username };
  } catch (error: any) {
    console.error("Error en handleGoogleOAuth:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Error con el login de Google.');
  }
};


// --- refreshAccessToken (Revisado levemente) ---
export const refreshAccessToken = async (): Promise<string> => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    console.warn("No refresh token available for refreshAccessToken.");
    throw new Error("No refresh token available");
  }
  try {
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/users/refresh-token`, {
      refreshToken: currentRefreshToken,
    });
    const newAccessToken = response.data.token;
    localStorage.setItem('token', newAccessToken); // Solo actualiza el token
    console.log("✅ Access Token refreshed and stored.");
    return newAccessToken;
  } catch (error: any)
   {
    console.error("❌ Failed to refresh token:", error.response?.data || error.message);
    clearAuthData(); // Si el refresh token falla, es una buena idea desloguear al usuario.
    throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
  }
};