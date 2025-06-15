import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateCombat.css";
import { useLanguage } from "../../context/LanguageContext";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { createCombat, getCombats } from "../../services/combatService";
import { Combat } from "../../models/Combat"; // Assegura't que la ruta sigui correcta
import { socket } from "../../socket";
import SimpleModal from "../SimpleModal/SimpleModal";

const CreateCombat: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState =
    location.state || JSON.parse(localStorage.getItem("combatState") || "{}");
  const { creator, opponent, creatorName, opponentName } = locationState;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gym, setGym] = useState("");
  const [gymName, setGymName] = useState("");
  const [level, setLevel] = useState<"amateur" | "professional" | "">(""); // Tipat més estricte
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showAllGyms, setShowAllGyms] = useState(false);
  const [userCombats, setUserCombats] = useState<Combat[]>([]); // Tipat com array de Combat
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { gyms } = await getGyms(1, 50); // Trae fins a 50 gimnasos
        setGyms(gyms);
        console.log("Gyms fetched:", gyms);
      } catch (error) {
        console.error("Error en obtenir els gimnasos:", error);
      }
    };
    fetchGyms();
  }, []);

  useEffect(() => {
    if (!opponent) {
      console.warn(
        "⚠️ No s'ha rebut un ID d'oponent. No es podrà crear el combat."
      );
    }
  }, [opponent]);

  useEffect(() => {
    // Carregar combats de l'usuari per validar la data
    if (creator) {
      // Asumint que getCombats pot filtrar per usuari
      // getCombats({ user: creator }).then((res) => { // Aquesta línia semblava incorrecta, la canvio per una que busca per boxerId
      getCombatsByBoxer(creator).then((res: { combats: any; }) => {
        setUserCombats(res.combats || []);
      });
    }
  }, [creator]);

  const filteredGyms = gyms.filter((g) =>
    g.name.toLowerCase().includes(gymName.toLowerCase())
  );

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCreateCombat = async () => {
    if (!date || !time || !gym || !level) {
      setModalMsg(t("fillAllFields"));
      setModalOpen(true);
      return;
    }
    if (!opponent) {
      setModalMsg(t("selectOpponentAlert"));
      setModalOpen(true);
      return;
    }
    
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime <= new Date()) {
      setModalMsg(t("futureDateAlert"));
      setModalOpen(true);
      return;
    }
    
    const hasCombatSameDay = userCombats.some(
      (c) => new Date(c.date).toDateString() === new Date(date).toDateString()
    );
    if (hasCombatSameDay) {
      setModalMsg(t("sameDayAlert"));
      setModalOpen(true);
      return;
    }

    const hasPendingWithOpponent = userCombats.some(
      (c) =>
        c.status === "pending" &&
        ((c.creator === creator && c.opponent === opponent) ||
          (c.creator === opponent && c.opponent === creator))
    );
    if (hasPendingWithOpponent) {
      setModalMsg(t("pendingWithOpponentAlert"));
      setModalOpen(true);
      return;
    }
    
    console.log("creator", creator);
    console.log("opponent", opponent);
    console.log("gym", gym);

    try {
      // --- CANVI PRINCIPAL AQUÍ ---
      // 1. Combinem date i time en un sol camp 'date' de tipus Date.
      // 2. Tipem explícitament l'objecte com a Partial<Combat> perquè TypeScript validi els tipus.
      const combatData: Partial<Combat> = {
        creator,
        opponent,
        date: selectedDateTime, // <-- S'utilitza l'objecte Date combinat
        gym,
        level,
        status: "pending", // <-- Ara TypeScript sap que "pending" és un valor vàlid per al tipus de 'status'
      };
      // --- FI DEL CANVI ---

      let combat;
      if (imageFile) {
        const formData = new FormData();
        // Cal convertir combatData a string per a que funcioni amb FormData si el backend no ho gestiona
        // O afegir cada camp individualment.
        Object.entries(combatData).forEach(([key, value]) => {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else if (value !== undefined) {
             formData.append(key, Array.isArray(value) ? value.join(",") : value);
          }
        });
        formData.append("image", imageFile);
        combat = await createCombat(formData);
      } else {
        combat = await createCombat(combatData);
      }

      socket.emit("sendCombatInvitation", { opponentId: opponent, combat });
      socket.emit("create_combat", combat);
      localStorage.removeItem("combatState");
      setModalMsg(t("combatCreated"));
      setModalOpen(true);
      navigate("/");
    } catch (error) {
      console.error("Error en crear el combat:", error);
      setModalMsg(t("combatCreateError"));
      setModalOpen(true);
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
      {!opponent && (
        <div style={{ color: "red", marginTop: "10px" }}>
          ⚠️ {t("noOpponentWarning")}
        </div>
      )}
      <form className="combat-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {t("levelLabel")}
          <select value={level} onChange={(e) => setLevel(e.target.value as "amateur" | "professional")}>
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
              "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
              "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
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
                {t("selectGymFromList")}
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
                <img
                  src={g.mainPhoto ? g.mainPhoto : "/logo.png"}
                  alt={g.name}
                  className="gym-img"
                />
                <div className="gym-name">{g.name}</div>
                <div className="gym-location">{g.place || t("noLocation")}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginBottom: "12px" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="file-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: "8px" }}
          >
            {t("addImage")}
          </button>
        </div>
        {imageFile && (
          <div style={{ margin: "10px 0" }}>
            <strong>{t("preview")}</strong>
            <br />
            <img
              src={URL.createObjectURL(imageFile)}
              alt={t("preview")}
              style={{
                maxWidth: "200px",
                maxHeight: "120px",
                borderRadius: "8px",
              }}
            />
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
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </div>
  );
};

export default CreateCombat;
// Mock implementation of getCombatsByBoxer

async function getCombatsByBoxer(creator: string): Promise<{ combats: Combat[] }> {
  try {
    const response = await getCombats({ boxerId: creator });
    return { combats: response.combats || [] };
  } catch (error) {
    console.error("Error fetching combats by boxer:", error);
    return { combats: [] };
  }
}

