import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { searchUsers } from "../../services/userService";
import { getToken } from "../../services/authService";
import { StepsSection } from "../StepsSection/SteptsSection";
import AboutSection from "../AboutSection/AboutSection"; // Importa el nuevo componente
import GymMap from "../Geolocalization/GymMap"; // Importa el componente del mapa
import "./Home.css";
import { AppPromoSection } from "../AppPromoSection/AppPromoSection"; // Importa el nuevo componente
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext"; // Importa el contexto de idioma

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [city, setCity] = useState("");
  const [weight, setWeight] = useState("");
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
          console.error(t("searchErrorGeneral"), error.message);
        } else {
          console.error(t("searchErrorGeneral"), error);
        }
      }
    };
    fetchGyms();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!city && !weight) {
      setError(t("searchErrorEmpty"));
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError(t("searchErrorLogin"));
        return;
      }

      const results = await searchUsers(city, weight);
      if (results.length === 0) {
        setError(t("searchErrorNoResults"));
        return;
      }

      const searchParams = `?city=${encodeURIComponent(
        city
      )}&weight=${encodeURIComponent(weight)}`;
      navigate(`/search-results${searchParams}`, {
        state: { results },
      });
    } catch (err) {
      console.error(t("searchErrorGeneral"), err);
      setError(t("searchErrorGeneral"));
      setSearchResults([]);
    }
  };

  const handleContact = (userId: string) => {
    console.log(t("contactButton"), userId);
  };

  return (
    <>
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
              <option value="">{t("searchWeightPlaceholder")}</option>
              <option value="Peso pluma">{t("featherweight")}</option>
              <option value="Peso medio">{t("middleweight")}</option>
              <option value="Peso pesado">{t("heavyweight")}</option>
            </select>
            <button type="submit" className="search-button">
              {t("searchButton")}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>{t("searchResultsTitle")}</h2>
              <div className="results-list">
                {searchResults.map((user) => (
                  <div key={user.id} className="user-result-item">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>
                        {t("searchCityPlaceholder")}: {user.city}
                      </p>
                      <p>
                        {t("searchWeightPlaceholder")}: {user.weight}
                      </p>
                    </div>
                    <button
                      className="contact-button"
                      onClick={() => handleContact(user.id)}
                    >
                      {t("contactButton")}
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
