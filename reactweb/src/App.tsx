import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './components/home/Home';
import Login from './components/login/login';
import Register from './components/register/register';
import Profile from './components/profile/Profile';
import GymRegistration from './components/gyms/GymRegistration';
import './App.css';
import EditProfile from './EditProfile/EditProfile';

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
                  console.log('Usuario autenticado:', name); // Depuración
                  setUser({ name });
                }}
              />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route
            path="/edit-profile"
            element={<EditProfile user={user} onUpdateUser={(updatedUser) => setUser(updatedUser)} />}
          />
          <Route path="/gym-registration" element={<GymRegistration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;