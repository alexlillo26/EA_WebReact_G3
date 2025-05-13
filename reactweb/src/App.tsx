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
import { getToken, handleGoogleOAuth } from "./services/authService";
import SearchResults from "./components/SearchResults/SearchResults";
import { LanguageProvider } from "./context/LanguageContext";
import AccessibilityMenu from "./components/AccessibilityMenu/AccessibilityMenu";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
    const googleToken = searchParams.get("token"); // Extract token from URL
    console.log("Google OAuth code:", googleCode);
    console.log("Google OAuth token:", googleToken);

    if (googleToken) {
      console.log("Saving Google token and refreshToken to localStorage."); // Debug log
      localStorage.setItem("token", googleToken); // Save token to localStorage
      // Ensure refreshToken is not lost
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("No refreshToken found after Google login. Check OAuth flow.");
      }
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
          <Route
            path="/login"
            element={
              <Login onLogin={(name) => setUser({ id: "temp-id", name })} />
            }
          />
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
