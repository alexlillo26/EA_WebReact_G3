import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socket as socketInstance } from '../socket'; // Importa TU instancia de socket
import { useAuth } from './AuthContext'; // Depende del AuthContext para saber si conectar


interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Obtiene el estado de autenticación

  useEffect(() => {
    if (isAuthenticated) {
      // Si el usuario está autenticado, conecta el socket
      console.log('Usuario autenticado, conectando socket...');
      socketInstance.connect();
    } else {
      // Si no está autenticado, lo desconecta
      console.log('Usuario no autenticado, desconectando socket...');
      socketInstance.disconnect();
    }

    // La función de limpieza se asegura de que al desmontar el provider se desconecte
    return () => {
      console.log('SocketProvider se desmonta, desconectando socket...');
      socketInstance.disconnect();
    };
  }, [isAuthenticated]); // Se ejecuta cada vez que cambia el estado de autenticación

  return (
    <SocketContext.Provider value={{ socket: socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};