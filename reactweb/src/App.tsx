import React, { useState, useEffect } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom"; // Removed BrowserRouter
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
import SearchResults from './components/SearchResults/SearchResults';

interface User {
  id: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();

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
      localStorage.setItem("token", googleToken); // Save token to localStorage
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
  }, [searchParams]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return (
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
    </div>
  );
}

export default App;
