import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchUsers } from "../../services/userService";
import "./SearchResults.css";
import { useLanguage } from "../../context/LanguageContext";

const SearchResults = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [city, setCity] = useState(queryParams.get("city") || "");
  const [weight, setWeight] = useState(queryParams.get("weight") || "");
  const [level, setLevel] = useState(queryParams.get("level") || "");
  const [searchResults, setSearchResults] = useState(
    location.state?.results || []
  );
  const [error, setError] = useState("");

  const translateWeight = (weight: string) => {
    switch (weight) {
      case "Peso pluma":
        return t("featherweight");
      case "Peso medio":
        return t("middleweight");
      case "Peso pesado":
        return t("heavyweight");
      default:
        return weight; // Devuelve el valor original si no coincide
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!city && !weight) {
      setError(t("searchErrorEmpty2"));
      return;
    }

    try {
      const results = await searchUsers(city, weight);
      setSearchResults(results);
      const searchParams = new URLSearchParams();
      if (city) searchParams.set("city", city);
      if (weight) searchParams.set("weight", weight);
      if (level) searchParams.set("level", level);
      navigate(`/search-results?${searchParams.toString()}`, {
        state: { results },
        replace: true,
      });
    } catch (err) {
      setError(t("searchErrorGeneral2"));
      setSearchResults([]);
    }
  };

  return (
    <div className="search-results-container">
      <div className="search-bar-container">
        <form onSubmit={handleSearch} className="search-form">
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
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">{t("searchLevelPlaceholder")}</option>
            <option value="Amateur">{t("amateur")}</option>
            <option value="Profesional">{t("professional")}</option>
            <option value="Sparring">{t("sparring")}</option>
          </select>
          <button type="submit">{t("searchButton")}</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="results-container">
        {searchResults.length > 0 ? (
          searchResults.map((user: any) => (
            <div key={user.id} className="result-card">
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>
                  {t("cityLabel")}: {user.city}
                </p>
                <p>
                  {t("weightLabel")}: {translateWeight(user.weight)}
                </p>
                <p>
                  {t("levelLabel")}: {user.level}
                </p>
              </div>
              <button className="contact-button">{t("contactButton")}</button>
            </div>
          ))
        ) : (
          <p className="no-results">{t("noResultsFound")}</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
