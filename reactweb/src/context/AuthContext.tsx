import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as authService from '../services/authService'; // Usa tu servicio existente

// Tu interfaz de Usuario
interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
  // Ya no necesitamos 'login' aquí porque el estado se actualiza automáticamente por los efectos
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Función para decodificar el token, movida aquí para ser reutilizada
const decodeToken = (token: string): User | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return { id: decodedPayload.id, name: decodedPayload.name || decodedPayload.username || "Usuario" };
    } catch (error) {
        console.error("Error decodificando el token:", error);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Toda la lógica de inicialización que tenías en App.tsx ahora vive aquí
  useEffect(() => {
    const initialize = async () => {
      // 1. Revisa si hay un token de Google en la URL
      const googleToken = searchParams.get("token");
      const googleRefreshToken = searchParams.get("refreshToken");

      if (googleToken && googleRefreshToken) {
        authService.setTokens(googleToken, googleRefreshToken);
        const decodedUser = decodeToken(googleToken);
        if (decodedUser) {
          setUser(decodedUser);
          localStorage.setItem("userData", JSON.stringify(decodedUser));
        }
        // Limpia los parámetros de la URL
        searchParams.delete('token');
        searchParams.delete('refreshToken');
        setSearchParams(searchParams);
        return; // Termina la inicialización aquí
      }

      // 2. Revisa si hay código de Google en la URL (flujo antiguo)
      const googleCode = searchParams.get("code");
      if (googleCode) {
        try {
          const userData = await authService.handleGoogleOAuth(googleCode);
          setUser(userData);
          // handleGoogleOAuth ya guarda el 'userData' en localStorage
          searchParams.delete('code');
          setSearchParams(searchParams);
        } catch (error) {
          console.error("Google OAuth error:", error);
        }
        return; // Termina la inicialización aquí
      }
      
      // 3. Si no hay nada en la URL, intenta inicializar desde el localStorage
      const storedToken = authService.getToken();
      if (storedToken) {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser) {
          setUser(decodedUser);
          localStorage.setItem("userData", JSON.stringify(decodedUser)); // Asegura que userData esté sincronizado
        } else {
          // Si el token es inválido/expirado, limpia todo
          authService.clearTokens();
          setUser(null);
        }
      }
    };

    initialize();
  }, [searchParams, setSearchParams]);

  const logout = useCallback(() => {
    authService.clearTokens();
    setUser(null);
    // La redirección ahora puede manejarse en el componente que llama a logout
    window.location.href = '/login';
  }, []);

  const value = {
    isAuthenticated: !!user,
    user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};