import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import { getToken } from "./services/authService";
import jwtDecode from "jwt-decode"; // Use named import

// Define the User type
interface User {
  id: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeUser = () => {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const token = getToken();
        if (token) {
          try {
            const decoded = jwtDecode<{ id: string; name?: string }>(token); // Fix call
            if (decoded && decoded.id) {
              const userData = {
                id: decoded.id,
                name: decoded.name || "Usuario",
              };
              setUser(userData);
              localStorage.setItem("userData", JSON.stringify(userData));
            }
          } catch (error) {
            console.error("Error al decodificar el token:", error);
            setUser(null);
          }
        }
      }
    };

    initializeUser();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <Router>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
