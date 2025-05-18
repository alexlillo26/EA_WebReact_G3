import React, { useState, useEffect, useRef } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Login from "./components/Login/login";
import Register from "./components/Register/register";
import Profile from "./components/Profile/Profile";
import GymRegistration from "./components/Gyms/GymRegistration";
import GymList from "./components/Gyms/GymList";
import CombatList from "./components/CombatList/CombatList";
import "./App.css";
import GymLogin from "./components/Gyms/GymLogin";
import GymToggleCard from "./components/Gyms/GymToggleCard";
import Statistics from "./components/Statistics/Statistics";
import { getToken, handleGoogleOAuth } from "./services/authService";
import SearchResults from "./components/SearchResults/SearchResults";
import { LanguageProvider } from "./context/LanguageContext";
import AccessibilityMenu from "./components/AccessibilityMenu/AccessibilityMenu";
import "@fortawesome/fontawesome-free/css/all.min.css";
import CreateCombat from "./components/CreateCombat/CreateCombat";
import GymCombats from "./components/GymCombats/GymCombats";
import GymProfile from "./components/GymProfile/GymProfile";
import HomeGym from "./components/home/HomeGym";

interface User {
  id: string;
  name: string;
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      </div>
    </LanguageProvider>
  );
}

export default App;
