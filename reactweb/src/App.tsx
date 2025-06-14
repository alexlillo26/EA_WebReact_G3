import React, { useState, useEffect, useRef, JSX } from "react";
import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Login from "./components/login/login";
import Register from "./components/register/register";
import Profile from "./components/profile/Profile";
import GymRegistration from "./components/gyms/GymRegistration";
import GymList from "./components/gyms/GymList";
import CombatList from "./components/CombatList/CombatList";
import "./App.css";
import GymLogin from "./components/gyms/GymLogin";
import GymToggleCard from "./components/gyms/GymToggleCard";
import { getToken, handleGoogleOAuth } from "./services/authService";
import SearchResults from "./components/SearchResults/SearchResults";
import { LanguageProvider } from "./context/LanguageContext";
import AccessibilityMenu from "./components/AccessibilityMenu/AccessibilityMenu";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CreateCombat from "./components/CreateCombat/CreateCombat";
import GymCombatHistory from "./components/CombatHistory/GymCombatHistory";
import GymProfile from "./components/GymProfile/GymProfile";
import HomeGym from "./components/home/HomeGym";
import { socket } from "./socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyCombats from "./components/MyCombats/MyCombats";
import { getCombats } from "./services/combatService";
import CombatHistoryPage from "./pages/CombatHistoryPage/CombatHistoryPage";
import UserStatisticsPage from "./components/Statistics/UserStatisticsPage";
import { storePushSubscription } from "./services/followService";
import ChatPage from "./pages/ChatPage"; // <-- IMPORTAMOS LA PÁGINA DE CHAT
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

interface User {
  id: string;
  name: string;
}

// Usa la clave pública VAPID real del backend (.env)
const VAPID_PUBLIC_KEY = "BFXmSopn7qLS5OrzYStJH8mRYfAm75vwQRP1Ws-XL48p699t1TobmBBvcSnhqxH0ZZ4IpMoN7DnNzPhm-eJVQl0";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ProtectedRoute para rutas privadas
const ProtectedRoute = ({
  user,
  children,
}: {
  user: User | null;
  children: JSX.Element;
}) => {
  const tokenExists = getToken();

  if (!user && !tokenExists) {
    console.log(
      "ProtectedRoute: No user state and no token, redirecting to login."
    );
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Añade función para registrar push notifications
async function registerPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.register("/push-sw.js");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Usa el servicio centralizado para guardar la suscripción push
    await storePushSubscription(subscription);

    console.log("✅ Push subscription saved.");
  } catch (err) {
    console.error("Error registrando push notifications:", err);
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] =
    useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsAccessibilityPanelOpen(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const { id } = JSON.parse(userData);
        getCombats({ status: "pending", opponent: id }).then((res) => {
          const count = res.combats ? res.combats.length : 0;
          localStorage.setItem("pendingInvitations", String(count));
          if (count > 0) {
            toast.info(
              `Tienes ${count} combate(s) pendiente(s) de aceptar o rechazar`
            );
          }
        });
      } catch (error) {
        console.error("Error processing combat invitations on mount:", error);
      }
    }
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("userData");
      console.log("Stored user:", storedUser);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const token = getToken();
        console.log("Token from localStorage:", token);
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            console.log("Decoded token:", decoded);
            const userData = {
              id: decoded.id,
              name: decoded.name || "Usuario",
            };
            setUser(userData);
            const oldUserData = JSON.parse(localStorage.getItem("userData") || "{}");
            localStorage.setItem("userData", JSON.stringify({ ...oldUserData, ...userData }));
          } catch (error) {
            console.error("Error decoding token:", error);
            setUser(null);
          }
        }
      }
    };

    const googleCode = searchParams.get("code");
    const googleToken = searchParams.get("token");
    const googleRefreshToken = searchParams.get("refreshToken");
    console.log("Google OAuth code:", googleCode);
    console.log("Google OAuth token:", googleToken);
    console.log("Google OAuth refreshToken:", googleRefreshToken);

    if (googleToken && googleRefreshToken) {
      localStorage.setItem("token", googleToken);
      localStorage.setItem("refreshToken", googleRefreshToken);
      console.log("✅ Tokens guardados tras login con Google.");
      try {
        const decoded = JSON.parse(atob(googleToken.split(".")[1]));
        console.log("Decoded token from URL:", decoded);
        const userData = { id: decoded.id, name: decoded.name || "Usuario" };
        setUser(userData);
        const oldUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        localStorage.setItem("userData", JSON.stringify({ ...oldUserData, ...userData }));
        // Redirige para limpiar los tokens de la URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Error decoding token from URL:", error);
      }
    } else if (googleCode) {
      handleGoogleOAuth(googleCode)
        .then((userData) => {
          console.log("User data from Google OAuth:", userData);
          setUser(userData);
          const oldUserData = JSON.parse(localStorage.getItem("userData") || "{}");
          localStorage.setItem("userData", JSON.stringify({ ...oldUserData, ...userData }));
        })
        .catch((error) => console.error("Google OAuth error:", error));
    } else {
      initializeUser();
    }

    const handleSocketEvents = () => {
      // Socket.IO listeners
      socket.on("combat_invitation", (combat) => {
        console.log("[Socket] combat_invitation recibido:", combat);
        toast.info("¡Has recibido una nueva invitación de combate!");
      });
      socket.on("combat_response", ({ combatId, status }) => {
        console.log("[Socket] combat_response recibido:", combatId, status);
        toast.info(`Respuesta a tu combate: ${status}`);
      });

      socket.on("newCombatInvitation", (combatData) => {
        console.log("[Socket] newCombatInvitation recibido:", combatData);
        toast.info("¡Nueva invitación de combate recibida!");
      });

      // Notificación cuando un usuario seguido crea o acepta un combate
      socket.on("new_combat_from_followed", ({ combat, actor }) => {
        const name = actor.name || "Usuario";
        toast.info(`¡${name} tiene un nuevo combate programado!`);
      });
    };

    handleSocketEvents();

    return () => {
      socket.off("combat_invitation");
      socket.off("combat_response");
      socket.off("newCombatInvitation");
      socket.off("new_combat_from_followed");
    };
  }, [searchParams, isAccessibilityPanelOpen]);

  // Nuevo useEffect: registra push notifications SOLO cuando user está listo
  useEffect(() => {
    if (!user) return;
    if (!("serviceWorker" in navigator && "PushManager" in window)) return;
    registerPushNotifications();
  }, [user]);

  // Nuevo useEffect: escucha mensajes push del Service Worker y muestra toast in-app
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Handler para mensajes push in-app
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "IN_APP_PUSH") {
        const { title, body } = event.data.payload;
        toast.info(
          <div>
            <strong>{title}</strong>
            <div>{body}</div>
          </div>,
          { autoClose: 5000 }
        );
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, []);

  const handleLogin = (user: { id: string; name: string }) => {
    setUser(user);
    const oldUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    localStorage.setItem("userData", JSON.stringify({ ...oldUserData, ...user }));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

 return (
    // CAMBIO 1: Envolvemos todo en los Providers para que el chat funcione.
    // El AuthProvider no recibe props aquí.
    <AuthProvider>
      <SocketProvider>
        {/* El LanguageProvider de tus compañeros se queda donde estaba */}
        <LanguageProvider>
          <div className="landing-page">
            {/* El Header no cambia, sigue recibiendo sus props como siempre */}
            <Header user={user} onLogout={handleLogout} />
            
            <Routes>
              {/* --- Rutas Públicas (Sin cambios) --- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/gym-registration" element={<GymRegistration />} />
              <Route path="/gym-login" element={<GymLogin />} />
              <Route path="/gym-toggle" element={<GymToggleCard />} />
              <Route path="/gyms" element={<GymList />} />
              <Route path="/combats" element={<CombatList />} />

              {/* --- Rutas Protegidas (Sin cambios en cómo funcionan) --- */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute user={user}>
                    <Profile user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/combates"
                element={
                  <ProtectedRoute user={user}>
                    <MyCombats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estadisticas"
                element={
                  <ProtectedRoute user={user}>
                    <CombatHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search-results"
                element={
                  <ProtectedRoute user={user}>
                    <SearchResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-combat"
                element={
                  <ProtectedRoute user={user}>
                    <CreateCombat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gym-combats"
                element={
                  <ProtectedRoute user={user}>
                    <GymCombatHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gym-profile"
                element={
                  <ProtectedRoute user={user}>
                    <GymProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gym-home"
                element={
                  <ProtectedRoute user={user}>
                    <HomeGym />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-statistics"
                element={
                  <ProtectedRoute user={user}>
                    <UserStatisticsPage />
                  </ProtectedRoute>
                }
              />

              {/* CAMBIO 2: AÑADIMOS LAS RUTAS PARA EL CHAT */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute user={user}>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/chat/:conversationId" 
                element={
                  <ProtectedRoute user={user}>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            
            {/* --- Resto de la UI (Sin cambios) --- */}
            <div className="accessibility-button">
              <button onClick={() => setIsAccessibilityPanelOpen(true)}>
                <i className="fas fa-universal-access"></i>
              </button>
            </div>
            <AccessibilityMenu
              isOpen={isAccessibilityPanelOpen}
              onClose={() => setIsAccessibilityPanelOpen(false)}
            />
            <ToastContainer position="top-right" autoClose={4000} />
          </div>
        </LanguageProvider>
      </SocketProvider>
    </AuthProvider>
  );
  }

export default App;