import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Login from "./components/login/login";
import Register from "./components/register/register";
import Profile from "./components/profile/Profile";
import GymRegistration from "./components/gyms/GymRegistration";
import GymList from "./components/gyms/GymList";
import CombatList from "./components/CombatList/CombatList"; // Importa el componente CombatList
import "./App.css";
import GymLogin from "./components/gyms/GymLogin";
import GymToggleCard from "./components/gyms/GymToggleCard";

interface User {
  name: string;
}

function App() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  return (
    <Router>
      <div className="landing-page">
        <Header user={user} onLogout={() => setUser(null)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <Login
                onLogin={(name) => {
                  console.log("Usuario autenticado:", name); // Depuración
                  setUser({ name });
                }}
              />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/gym-registration" element={<GymRegistration />} />
          <Route path="/gym-login" element={<GymLogin />} />
          <Route path="/gym-toggle" element={<GymToggleCard />} />
          {/* Cambia esto a GymLogin si es necesario */}
          <Route path="/gyms" element={<GymList />} />
          <Route path="/combats" element={<CombatList />} />{" "}
          {/* Nueva ruta para CombatList */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
