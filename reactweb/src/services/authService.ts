import axios from "axios";

const API_BASE_URL = "http://localhost:9000/api";

interface LoginResponse {
  token: string;
  refreshToken: string;
}

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

export const setTokens = (token: string, refreshToken: string): void => {
  console.log("Storing tokens:", { token, refreshToken }); // Debug log
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
  setTokens(token, refreshToken);
};

export const handleGoogleOAuth = async (code: string): Promise<{ id: string; name: string }> => {
  console.log("Handling Google OAuth with code:", code);
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/google`, { code });
  const { token, refreshToken } = response.data;
  console.log("Received token:", token);
  console.log("Received refreshToken:", refreshToken);
  setTokens(token, refreshToken);

  const decoded = JSON.parse(atob(token.split('.')[1])); // Decode token
  console.log("Decoded token payload:", decoded);
  const userData = { id: decoded.id, name: decoded.name || "Usuario" };
  localStorage.setItem("userData", JSON.stringify(userData)); // Save user state
  return userData;
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  console.log("🔄 Attempting to refresh with refreshToken:", refreshToken); // Debug log

  if (!refreshToken) {
    console.warn("No refresh token available. User might need to reauthenticate.");
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/users/refresh-token`, {
      refreshToken,
    });
    console.log("✅ Token refreshed successfully:", response.data.token);
    setTokens(response.data.token, refreshToken); // Save the new token
    return response.data.token;
  } catch (error: any) {
    console.error("❌ Failed to refresh token:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = (): void => {
  clearTokens();
  window.location.href = "/login";
};
