import React, { useState, useEffect, useRef } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
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
import Statistics from "./components/Statistics/Statistics";
import { getToken, handleGoogleOAuth, fetchMyProfile, logout } from "./services/authService";
import SearchResults from "./components/SearchResults/SearchResults";
import { LanguageProvider } from "./context/LanguageContext";
import AccessibilityMenu from "./components/AccessibilityMenu/AccessibilityMenu";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CreateCombat from "./components/CreateCombat/CreateCombat";
import GymCombats from "./components/GymCombats/GymCombats";
import GymProfile from "./components/GymProfile/GymProfile";
import HomeGym from "./components/home/HomeGym";
import { socket } from "./socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyCombats from "./components/MyCombats/MyCombats";
import { getCombats } from "./services/combatService";

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] =
    useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pendingInvitations, setPendingInvitations] = useState(0);

  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsAccessibilityPanelOpen(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { id } = JSON.parse(userData);
      getCombats({ status: "pending", opponent: id }).then((res) => {
        const count = res.combats ? res.combats.length : 0;
        setPendingInvitations(count);
        localStorage.setItem("pendingInvitations", String(count));
        if (count > 0) {
          toast.info(
            `Tienes ${count} combate(s) pendiente(s) de aceptar o rechazar`
          );
        }
      });
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
            localStorage.setItem("userData", JSON.stringify(userData));
          } catch (error) {
            console.error("Error decoding token:", error);
            setUser(null);
          }
        }
      }
    };

    const googleCode = searchParams.get("code");
    const googleToken = searchParams.get("token");
    const googleRefreshToken = searchParams.get("refreshToken"); // Extract refreshToken from URL
    console.log("Google OAuth code:", googleCode);
    console.log("Google OAuth token:", googleToken);
    console.log("Google OAuth refreshToken:", googleRefreshToken);

    if (googleToken && googleRefreshToken) {
      localStorage.setItem("token", googleToken); // Save token to localStorage
      localStorage.setItem("refreshToken", googleRefreshToken); // Save refreshToken to localStorage
      console.log("✅ Tokens guardados tras login con Google.");
      try {
        const decoded = JSON.parse(atob(googleToken.split(".")[1]));
        console.log("Decoded token from URL:", decoded);
        const userData = { id: decoded.id, name: decoded.name || "Usuario" };
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
      } catch (error) {
        console.error("Error decoding token from URL:", error);
      }
    } else if (googleCode) {
      handleGoogleOAuth(googleCode)
        .then((userData) => {
          console.log("User data from Google OAuth:", userData);
          setUser(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        })
        .catch((error) => console.error("Google OAuth error:", error));
    } else {
      initializeUser();
    }

    if (isAccessibilityPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Socket.IO listeners
    socket.on("combat_invitation", (combat) => {
      console.log("[Socket] combat_invitation recibido:", combat);
      // Aquí podrías actualizar el estado global de invitaciones si usas contexto o redux
      toast.info("¡Has recibido una nueva invitación de combate!");
    });
    socket.on("combat_response", ({ combatId, status }) => {
      console.log("[Socket] combat_response recibido:", combatId, status);
      toast.info(`Respuesta a tu combate: ${status}`);
    });

    // Escucha el evento personalizado del backend para nuevas invitaciones
    socket.on("newCombatInvitation", (combatData) => {
      console.log("[Socket] newCombatInvitation recibido:", combatData);
      toast.info("¡Nueva invitación de combate recibida!");
      // Aquí podrías actualizar el estado global de invitaciones
    });

    // NUEVO: Notificación cuando un usuario seguido crea o acepta un combate
    socket.on("new_combat_from_followed", ({ combat, createdBy }) => {
      // Puedes obtener el nombre del usuario seguido si viene en el objeto combat
      const followedName =
        (combat.creator && combat.creator.name) ||
        (combat.creator && typeof combat.creator === "string" ? combat.creator : "Un usuario seguido");
      toast.info(
        `¡${followedName} ha creado o aceptado un nuevo combate!`
      );
    });

    // REGISTRO SERVICE WORKER Y SUSCRIPCIÓN PUSH
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/push-sw.js")
        .then(async (registration) => {
          // Solicita permiso al usuario
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;

          // Suscribe al usuario
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });

          // Envía la suscripción al backend (endpoint correcto y formato correcto)
          await fetch(`${process.env.REACT_APP_API_BASE_URL || "/api"}/followers/push-subscription`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ subscription }),
          });
        })
        .catch((err) => {
          console.error("Error registrando el Service Worker o suscribiendo a push:", err);
        });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("combat_invitation");
      socket.off("combat_response");
      socket.off("newCombatInvitation");
      socket.off("new_combat_from_followed");
    };
  }, [searchParams, isAccessibilityPanelOpen]);

  const handleLogin = (user: { id: string; name: string }) => {
    setUser(user);
    localStorage.setItem("userData", JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return (
    <LanguageProvider>
      <div className="landing-page">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/gym-registration" element={<GymRegistration />} />
          <Route path="/gym-login" element={<GymLogin />} />
          <Route path="/gym-toggle" element={<GymToggleCard />} />
          <Route path="/gyms" element={<GymList />} />
          <Route path="/combats" element={<CombatList />} />
          <Route path="/combates" element={<MyCombats />} />
          <Route
            path="/estadisticas"
            element={<Statistics boxerId="6802ab47458bfd82550849ed" />}
          />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/create-combat" element={<CreateCombat />} />
          <Route path="/gym-combats" element={<GymCombats />} />
          <Route path="/gym-profile" element={<GymProfile />} />
          <Route path="/gym-home" element={<HomeGym />} />
        </Routes>
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
  );
}

export default App;
