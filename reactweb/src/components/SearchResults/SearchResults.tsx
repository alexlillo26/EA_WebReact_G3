import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchUsers } from "../../services/userService";
import { getCombats } from "../../services/combatService";
import "./SearchResults.css";
import { useLanguage } from "../../context/LanguageContext";
import SimpleModal from "../SimpleModal/SimpleModal";

const SearchResults = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const [city, setCity] = useState(queryParams.get("city") || "");
  const [weight, setWeight] = useState(queryParams.get("weight") || "");
  const [searchResults, setSearchResults] = useState(
    location.state?.results || []
  );
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [pendingCombats, setPendingCombats] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData"); // <-- Cambia aquí
    // Solo obtener el usuario logueado, nunca sobrescribirlo aquí
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      // Cargar combates pendientes para filtrar posibles oponentes
      const { id } = JSON.parse(storedUser);
      getCombats({ status: "pending", user: id }).then((res) => {
        setPendingCombats(res.combats || []);
      });
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
      setModalMsg(t("searchErrorEmpty2"));
      setModalOpen(true);
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
      setModalMsg(t("searchErrorGeneral2"));
      setModalOpen(true);
      setSearchResults([]);
    }
  };

  // Helper: comprobar si ya hay combate pendiente con ese usuario
  function hasPendingCombatWith(userId: string) {
    return pendingCombats.some(
      (c) =>
        (c.creator === currentUser?.id && c.opponent === userId) ||
        (c.creator === userId && c.opponent === currentUser?.id)
    );
  }

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
          searchResults
            .filter(
              (user: any) =>
                user.id !== currentUser?.id && user._id !== currentUser?.id
            )
            .map((user: any) => (
              <div key={user.id || user._id} className="result-card">
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
                  <button className="contact-button">
                    {t("contactButton")}
                  </button>
                  <button
                    className="view-profile-button"
                    onClick={() => navigate(`/profile/${user.id || user._id}`)}
                  >
                    {t("viewProfileButton")}
                  </button>
                  {currentUser &&
                    !hasPendingCombatWith(user.id || user._id) && (
                      <button
                        className="create-combat-button"
                        onClick={() => {
                          const opponentId = user.id || user._id;
                          console.log("✅ opponent id:", opponentId);
                          const combatState = {
                            creator: currentUser.id,
                            creatorName: currentUser.name,
                            opponent: opponentId,
                            opponentName: user.name,
                          };
                          localStorage.setItem(
                            "combatState",
                            JSON.stringify(combatState)
                          );
                          navigate("/create-combat", { state: combatState });
                        }}
                      >
                        {t("createCombatButton")}
                      </button>
                    )}
                  {currentUser && hasPendingCombatWith(user.id || user._id) && (
                    <span
                      style={{
                        color: "#d62828",
                        fontWeight: 600,
                        fontSize: "0.95em",
                      }}
                    >
                      {t("pendingCombatsSentTitle")}
                    </span>
                  )}
                </div>
              </div>
            ))
        ) : (
          <p className="no-results">{t("noResultsFound")}</p>
        )}
      </div>
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </div>
  );
};

export default SearchResults;
