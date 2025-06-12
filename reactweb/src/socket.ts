import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./services/apiConfig";

// Extrae solo el host (por ej. http://localhost:9000) eliminando “/api”
const SOCKET_URL = API_BASE_URL.replace("/api", "");

// Siempre lee el token más reciente de localStorage
function getAuthToken() {
  return localStorage.getItem("token") || "";
}

// Exporta una función para crear el socket (útil si necesitas reconectar tras login)
export function createSocket(): Socket {
  const socket = io(SOCKET_URL, {
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

export const socket = createSocket();

// Si el usuario hace login más tarde (token nuevo), llama a:
// socket.auth.token = localStorage.getItem("token") || "";
// socket.connect();
