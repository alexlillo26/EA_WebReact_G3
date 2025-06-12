import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { searchUsers } from "../../services/userService";
import { getToken } from "../../services/authService";
import { StepsSection } from "../StepsSection/SteptsSection";
import AboutSection from "../AboutSection/AboutSection";
import GymMap from "../Geolocalization/GymMap";
import "./Home.css";
import { AppPromoSection } from "../AppPromoSection/AppPromoSection";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { toast } from 'react-toastify';
import queryString from "query-string";

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [city, setCity] = useState("");
  const [weight, setWeight] = useState("");
  const [level, setLevel] = useState(""); // Añadimos estado para el nivel
  const [showGyms, setShowGyms] = useState(false); // Estado para el mapa de gimnasios
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await getGyms();
        setGyms(response.gyms);
      } catch (error) {
        console.error("Error al cargar los gimnasios:", error);
      }
    };
    fetchGyms();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city && !weight && !level) {
      toast.error(t("searchErrorEmpty"));
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        toast.error(t("searchErrorLogin") as string);
        navigate("/login"); // Redirige al login si no hay token
        return;
      }

      // No necesitas buscar aquí, solo navega con los parámetros
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (weight) params.weight = weight;
      // Si quieres incluir level, añade: if (level) params.level = level;

      navigate(`/search-results?${queryString.stringify(params)}`);
    } catch (err) {
      console.error(t("searchErrorGeneral"), err);
      toast.error(t("searchErrorGeneral") as string);
    }
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>{t("homeHeroTitle")}</h1>
          <p>{t("homeHeroSubtitle")}</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder={t("searchCityPlaceholder")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <select value={weight} onChange={(e) => setWeight(e.target.value)}>
              {/* CAMBIO: La primera opción ahora es "Cualquier peso" */}
              <option value="">{t("anyWeight")}</option>
              <option value="Peso pluma">{t("featherweight")}</option>
              <option value="Peso medio">{t("middleweight")}</option>
              <option value="Peso pesado">{t("heavyweight")}</option>
            </select>
            {/* He mantenido el selector de nivel que tenías en una versión anterior */}
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">{t("searchLevelPlaceholder")}</option>
              <option value="professional">{t("professional")}</option>
              <option value="amateur">{t("amateur")}</option>
              <option value="sparring">{t("sparring")}</option>
            </select>
            <button type="submit" className="search-button">
              {t("searchButton")}
            </button>
          </form>
        </div>
      </section>

      <StepsSection />
      <AboutSection />
      <div className="gym-map-section">
        <button className="gym-toggle-button" onClick={() => setShowGyms(!showGyms)}>
            {showGyms ? t("hideGyms") : t("seeGyms")}
        </button>
        {showGyms && <GymMap gyms={gyms} />}
      </div>
      <AppPromoSection />
    </div>
  );
};

export default Home;