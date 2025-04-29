import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import StepsSection from "../StepsSection/SteptsSection";
import AboutSection from "../AboutSection/AboutSection"; // Importa el nuevo componente
import GymMap from "../Geolocalization/GymMap"; // Importa el componente del mapa
import "./Home.css";

const Home: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Gym[]>([]);

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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = gyms.filter(
        (gym) =>
          gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gym.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [searchTerm, gyms]);

  const handleSelectSuggestion = (gymName: string) => {
    setSearchTerm(gymName);
    setSuggestions([]);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Organiza y encuentra combates de Boxeo al instante</h1>
          <p>
            Conecta con rivales, promotores y gimnasios. Participa en peleas
            equilibradas, entrena con los mejores y escala en el ranking.
          </p>
          <form className="search-form">
            <div className="autocomplete">
              <input
                type="text"
                placeholder="Ciudad, gimnasio o boxeador"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {suggestions.length > 0 && (
                <ul className="suggestions">
                  {suggestions.map((gym) => (
                    <li key={gym.id} onClick={() => handleSelectSuggestion(gym.name)}>
                      {gym.name} - {gym.place}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <select>
              <option value="amateur">Amateur</option>
              <option value="profesional">Profesional</option>
              <option value="sparring">Sparring</option>
            </select>
            <input type="date" />
            <select>
              <option value="peso-pluma">Peso pluma</option>
              <option value="peso-medio">Peso medio</option>
              <option value="peso-pesado">Peso pesado</option>
            </select>
            <button type="submit" className="search-button">
              Buscar Combate
            </button>
          </form>
        </div>
      </section>
      <StepsSection />
      <AboutSection />
      <GymMap gyms={gyms} />
    </>
  );
};

export default Home;
