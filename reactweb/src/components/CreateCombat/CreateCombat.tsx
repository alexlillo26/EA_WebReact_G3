import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateCombat.css";
import { useLanguage } from "../../context/LanguageContext";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { registerCombat } from "../../services/combatService";

const CreateCombat: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { creator, opponent, creatorName, opponentName } = location.state || {}; // Datos pasados desde SearchResults

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gym, setGym] = useState("");
  const [gymName, setGymName] = useState("");
  const [level, setLevel] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showAllGyms, setShowAllGyms] = useState(false);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { gyms } = await getGyms(1, 50); // Trae hasta 100 gimnasios
        setGyms(gyms);
        console.log("Gyms fetched:", gyms);
      } catch (error) {
        console.error("Error al obtener los gimnasios:", error);
      }
    };
    fetchGyms();
  }, []);

  const filteredGyms = gyms.filter((g) =>
    g.name.toLowerCase().includes(gymName.toLowerCase())
  );

  const handleCreateCombat = async () => {
    if (!date || !time || !gymName || !level) {
      alert(t("fillAllFields"));
      return;
    }

    try {
      await registerCombat({
        boxers: [creator, opponent],
        date: new Date(date),
        time,
        gym,
        level,
      });
      alert(t("combatCreated"));
      navigate("/");
    } catch (error) {
      alert("Error al crear el combate");
    }
  };

  return (
    <div className="create-combat-container">
      <h2>{t("createCombatTitle")}</h2>
      <div className="combat-info">
        <p className="combat-info-creator">
          <strong>{t("creatorLabel")}:</strong> {creatorName}
        </p>
        <p className="combat-info-opponent">
          <strong>{t("opponentLabel")}:</strong> {opponentName}
        </p>
      </div>
      <form className="combat-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {t("levelLabel")}
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">{t("searchLevelPlaceholder")}</option>
            <option value="amateur">{t("amateur")}</option>
            <option value="professional">{t("professional")}</option>
          </select>
        </label>
        <label>
          {t("dateLabel")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          {t("timeLabel")}
          <div className="hours-grid">
            {[
              "09:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
            ].map((h) => (
              <button
                type="button"
                key={h}
                className={`hour-btn${time === h ? " selected" : ""}`}
                onClick={() => setTime(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </label>
        <label>
          {t("gymLabel")}
          <div className="gym-input-row">
            <input
              type="text"
              placeholder={t("gymPlaceholder")}
              value={gymName}
              onChange={(e) => {
                setGymName(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            <button
              type="button"
              className="see-gyms-btn"
              onClick={() => setShowAllGyms((prev) => !prev)}
            >
              {showAllGyms ? t("hideGyms") : t("seeGyms")}
            </button>
            {showSuggestions && gymName && filteredGyms.length > 0 && (
              <ul className="gym-suggestions">
                {filteredGyms.map((g) => (
                  <li
                    key={g.id || g.name}
                    onMouseDown={() => {
                      if (g.id) {
                        setGym(g.id);
                        setGymName(g.name);
                        setShowSuggestions(false);
                      }
                    }}
                  >
                    {g.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>
        {showAllGyms && (
          <div className="all-gyms-grid">
            {gyms.map((g) => (
              <div
                key={g.id || g.name}
                className="gym-grid-item"
                onMouseDown={() => {
                  if (g.id) {
                    setGym(g.id);
                    setGymName(g.name);
                    setShowAllGyms(false);
                  }
                }}
              >
                <img src="/logo.png" alt={g.name} className="gym-img" />
                <div className="gym-name">{g.name}</div>
                <div className="gym-location">
                  {g.place || "Ubicación no disponible"}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="combat-form-confirm"
          type="submit"
          onClick={handleCreateCombat}
          disabled={!date || !time || !gym || !level}
        >
          {t("createCombatButton")}
        </button>
        <button
          className="combat-form-cancel"
          type="button"
          onClick={() => navigate("/search-results")}
        >
          {t("cancelButton")}
        </button>
      </form>
    </div>
  );
};

export default CreateCombat;
