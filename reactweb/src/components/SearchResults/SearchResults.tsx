import React, { useState, useEffect } from "react";
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
  const [searchResults, setSearchResults] = useState(
    location.state?.results || []
  );
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    console.log("Stored user1:", storedUser);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

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
              </div>
              <div className="result-card-buttons">
                <button className="contact-button">{t("contactButton")}</button>
                <button
                  className="view-profile-button"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  {t("viewProfileButton")}
                </button>
                <button
                  className="create-combat-button"
                  onClick={() =>
                    navigate("/create-combat", {
                      state: {
                        creator: currentUser?.name,
                        opponent: user.name,
                      },
                    })
                  }
                >
                  {t("createCombatButton")}
                </button>
              </div>
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
