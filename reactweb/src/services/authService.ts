import axios from "axios";

const API_BASE_URL = "http://localhost:9000/api";

interface LoginResponse {
  token: string;
  refreshToken: string;
}

export const getToken = (): string | null => {
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Log del token
  return token;
};

export const getRefreshToken = (): string | null => {
  const refreshToken = localStorage.getItem("refreshToken");
  console.log("Refresh Token:", refreshToken); // Log del refresh token
  return refreshToken;
};

export const setTokens = (token: string, refreshToken: string): void => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/users/login`, { email, password });
  const { token, refreshToken } = response.data;
  console.log("Login successful. Token:", token, "Refresh Token:", refreshToken); // Log de éxito
  setTokens(token, refreshToken);
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post<{ token: string }>(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
  const { token } = response.data;
  setTokens(token, refreshToken);
  return token;
};

export const logout = (): void => {
  console.log("Logging out..."); // Log de cierre de sesión
  clearTokens();
  window.location.href = "/login";
};
