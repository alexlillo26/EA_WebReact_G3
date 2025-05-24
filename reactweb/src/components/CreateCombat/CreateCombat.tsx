import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateCombat.css";
import { useLanguage } from "../../context/LanguageContext";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { createCombat, getCombats } from "../../services/combatService";
import { socket } from "../../socket";

// --- CAMBIO PRINCIPAL: Lee combatState de localStorage si no viene por location.state
const CreateCombat: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
    location.state ||
    JSON.parse(localStorage.getItem("combatState") || "{}");
  const { creator, opponent, creatorName, opponentName } = locationState;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gym, setGym] = useState("");
  const [gymName, setGymName] = useState("");
  const [level, setLevel] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showAllGyms, setShowAllGyms] = useState(false);
  const [userCombats, setUserCombats] = useState<any[]>([]);

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

  useEffect(() => {
    if (!opponent) {
      console.warn("⚠️ No se recibió un ID de oponente. No se podrá crear combate.");
    }
  }, [opponent]);

  useEffect(() => {
    // Cargar combates del usuario para validar fecha
    if (creator) {
      getCombats({ user: creator }).then(res => {
        setUserCombats(res.combats || []);
      });
    }
  }, [creator]);

  const filteredGyms = gyms.filter((g) =>
    g.name.toLowerCase().includes(gymName.toLowerCase())
  );

  const handleCreateCombat = async () => {
    if (!date || !time || !gym || !level) {
      alert(t("fillAllFields"));
      return;
    }
    if (!opponent) {
      alert("Selecciona un oponente antes de continuar");
      return;
    }
    // Validar fecha futura
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime <= new Date()) {
      alert("No puedes crear un combate en el pasado.");
      return;
    }
    // Validar que no haya otro combate el mismo día
    const hasCombatSameDay = userCombats.some(
      (c) => new Date(c.date).toDateString() === new Date(date).toDateString()
    );
    if (hasCombatSameDay) {
      alert("Ya tienes un combate ese día.");
      return;
    }
    // Validar que no exista ya una invitación pendiente con ese oponente
    const hasPendingWithOpponent = userCombats.some(
      (c) =>
        c.status === "pending" &&
        ((c.creator === creator && c.opponent === opponent) ||
         (c.creator === opponent && c.opponent === creator))
    );
    if (hasPendingWithOpponent) {
      alert("Ya tienes una invitación pendiente con este usuario.");
      return;
    }
    // Debug logs para verificar los valores
    console.log("creator", creator); // debe ser un ObjectId como string
    console.log("opponent", opponent);
    console.log("gym", gym);         // también

    try {
      const combatData = {
        creator,
        opponent,
        date,
        time,
        gym,
        level,
        status: "pending" as "pending",
      };
      console.log("Sending combat with:", combatData);
      const combat = await createCombat(combatData);
      // Emitir evento de invitación al oponente
      socket.emit("sendCombatInvitation", { opponentId: opponent, combat });
      socket.emit("create_combat", combat); // Notifica por socket (legacy)
      localStorage.removeItem("combatState"); // Limpia el estado temporal tras crear el combate
      alert(t("combatCreated"));
      navigate("/");
    } catch (error) {
      console.error("Error al crear el combate:", error);
      alert("Error al crear el combate");
    }
  };

  const handleGymSelect = (g: Gym) => {
    console.log("Gym clicked:", g);
    if (g._id) {
      setGym(g._id);
      setGymName(g.name);
      setShowAllGyms(false);
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
      {/* Advertencia visual si falta oponente */}
      {!opponent && (
        <div style={{ color: "red", marginTop: "10px" }}>
          ⚠️ No se ha definido un oponente. No podrás crear el combate.
        </div>
      )}
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
                setGym("");
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            {gymName && !gym && (
              <div style={{ color: "red", fontSize: "0.9em" }}>
                {"Selecciona un gimnasio de la lista"}
              </div>
            )}
            <button
              type="button"
              className="see-gyms-btn"
              onClick={() => setShowAllGyms((prev) => !prev)}
            >
              {showAllGyms ? t("hideGyms") : t("seeGyms")}
            </button>
            {showSuggestions &&
              !showAllGyms &&
              gymName &&
              filteredGyms.length > 0 && (
                <ul className="gym-suggestions">
                  {filteredGyms.map((g) => (
                    <li
                      key={g._id || g.name}
                      onClick={() => {
                        console.log("Gym clicked:", g);
                        if (g._id) {
                          setGym(g._id);
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
                key={g._id || g.name}
                className="gym-grid-item"
                onClick={() => handleGymSelect(g)}
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
          disabled={!opponent}
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
