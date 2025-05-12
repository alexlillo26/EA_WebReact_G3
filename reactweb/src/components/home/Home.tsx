import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { searchUsers } from "../../services/userService";
import { getToken } from "../../services/authService"; // 添加这一行
import StepsSection from "../StepsSection/SteptsSection";
import AboutSection from "../AboutSection/AboutSection"; // Importa el nuevo componente
import GymMap from "../Geolocalization/GymMap"; // Importa el componente del mapa
import "./Home.css";
import AppPromoSection from "../AppPromoSection/AppPromoSection"; // Importa el nuevo componente
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [city, setCity] = useState("");
  const [weight, setWeight] = useState("");
  const [level, setLevel] = useState(""); // 添加级别状态
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await getGyms(); // Explicitly typed response
        setGyms(response.gyms);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error al obtener los gimnasios:", error.message);
        } else {
          console.error("Error al obtener los gimnasios:", error);
        }
      }
    };
    fetchGyms();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!city && !weight) {
      setError("Por favor, introduce al menos un criterio de búsqueda");
      return;
    }

    try {
      const results = await searchUsers(city, weight);
      const searchParams = `?city=${encodeURIComponent(city)}&weight=${encodeURIComponent(weight)}&level=${encodeURIComponent(level)}`;
      navigate(`/search-results${searchParams}`, { 
        state: { results }
      });
    } catch (err) {
      setError("Error al realizar la búsqueda");
    }
  };

  const handleContact = (userId: string) => {
    // TODO: 实现联系功能
    console.log("Contactar con usuario:", userId);
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
    // 这里可以添加一些其他逻辑，比如保存用户偏好等
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Encuentra boxeadores cerca de ti</h1>
          <p>Conecta con rivales de tu nivel y organiza combates</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <select
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            >
              <option value="">Categoría de peso</option>
              <option value="Peso pluma">Peso pluma</option>
              <option value="Peso medio">Peso medio</option>
              <option value="Peso pesado">Peso pesado</option>
            </select>
            <select
              value={level}
              onChange={handleLevelChange}
              className="level-select"
            >
              <option value="">Nivel</option>
              <option value="Amateur">Amateur</option>
              <option value="Profesional">Profesional</option>
              <option value="Sparring">Sparring</option>
            </select>
            <button type="submit" className="search-button">
              Buscar Boxeadores
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>Boxeadores encontrados</h2>
              <div className="results-list">
                {searchResults.map((user) => (
                  <div key={user.id} className="user-result-item">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>Ciudad: {user.city}</p>
                      <p>Peso: {user.weight}</p>
                    </div>
                    <button 
                      className="contact-button"
                      onClick={() => handleContact(user.id)}
                    >
                      Contactar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      <StepsSection />
      <AboutSection />
      <GymMap gyms={gyms} />
      <AppPromoSection />
    </>
  );
};

export default Home;
