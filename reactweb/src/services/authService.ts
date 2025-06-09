import axios from "axios"; // Asumo que axios está en tus dependencias
import { API_BASE_URL } from "./apiConfig"; // Importa la baseURL centralizada
import axiosInstance from "./axiosInstance";

interface LoginResponse {
  token: string;
  refreshToken: string;
  // Añade aquí otros campos que tu endpoint de login pueda devolver,
  // por ejemplo, el objeto de usuario, si es que lo devuelve directamente.
  // user?: { id: string; name: string; isAdmin?: boolean; /* etc */ }; 
}

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

export const setTokens = (token: string, refreshToken: string): void => {
  console.log("WebReact - Storing tokens:", { token, refreshToken }); // Debug log
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData"); // También borra userData al hacer logout
};

export const login = async (email: string, password: string): Promise<void> => {
  // La petición irá a: https://ea3-api.upc.edu/api/users/login
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/api/users/login`, { email, password });
  const { token, refreshToken } = response.data;
  setTokens(token, refreshToken);
  // Nota: En tu login.tsx, decodificas el token para obtener los datos del usuario.
  // Asegúrate de que la estructura del payload del token sea la esperada.
};

export const handleGoogleOAuth = async (code: string): Promise<{ id: string; name: string }> => {
  console.log("WebReact - Handling Google OAuth with code:", code);
  // La petición irá a: https://ea3-api.upc.edu/api/auth/google
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/api/auth/google`, { code });
  const { token, refreshToken } = response.data;
  console.log("WebReact - Received token:", token);
  console.log("WebReact - Received refreshToken:", refreshToken);
  setTokens(token, refreshToken);

  // Decodificar el token para obtener datos del usuario
  // Asegúrate de que el payload del token JWT contenga 'id' y 'name' (o 'username')
  const decoded = JSON.parse(atob(token.split('.')[1])); 
  console.log("WebReact - Decoded token payload from Google OAuth:", decoded);
  const userData = { id: decoded.id, name: decoded.name || decoded.username || "Usuario" }; // Buscar name o username
  localStorage.setItem("userData", JSON.stringify(userData));
  return userData;
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  console.log("WebReact - 🔄 Attempting to refresh with refreshToken:", refreshToken);

  if (!refreshToken) {
    console.warn("WebReact - No refresh token available. User might need to reauthenticate.");
    clearTokens();
    throw new Error("No refresh token available. Please login again.");
  }

  try {
    // Cambia la ruta si tu backend usa /auth/refresh-token
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/api/users/refresh-token`, {
      refreshToken,
    });
    console.log("WebReact - ✅ Token refreshed successfully:", response.data.token);
    setTokens(response.data.token, refreshToken);
    return response.data.token;
  } catch (error: any) {
    console.error("WebReact - ❌ Failed to refresh token:", error.response?.data || error.message);
    clearTokens();
    throw new Error(error.response?.data?.message || "Session expired. Please login again.");
  }
};

export const logout = (): void => {
  clearTokens();
  // Para React Router v6+, la redirección programática se hace usualmente con el hook useNavigate
  // Si este authService no es un componente React, window.location.href es una forma de forzarlo.
  // Considera manejar la navegación en el componente que llama a logout().
  window.location.href = "/login"; 
};

export const fetchMyProfile = async () => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};