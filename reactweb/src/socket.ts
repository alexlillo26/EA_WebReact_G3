import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './services/apiConfig';

// Siempre lee el token más reciente de localStorage
function getAuthToken() {
  return localStorage.getItem("token") || "";
}

// Exporta una función para crear el socket (útil si necesitas reconectar tras login)
export function createSocket(): Socket {
  const socket = io(API_BASE_URL.replace('/api', ''), {
    autoConnect: true,
    transports: ["websocket"],
    auth: {
      token: getAuthToken(),
    },
  });
  socket.on("connect", () => {
    console.log("[Socket] Conectado con id:", socket.id);
  });
  socket.on("disconnect", (reason) => {
    console.log("[Socket] Desconectado:", reason);
  });
  return socket;
}

// Instancia global (puedes usar esta en la app)
export const socket = createSocket();

// Si quieres reconectar tras login:
// socket.auth.token = localStorage.getItem("token") || "";
// socket.connect();
