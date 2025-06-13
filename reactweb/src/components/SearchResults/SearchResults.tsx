import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchUsers } from "../../services/userService";
import { getCombats } from "../../services/combatService";
import "./SearchResults.css";
import { useLanguage } from "../../context/LanguageContext";
import SimpleModal from "../SimpleModal/SimpleModal";
import SeeProfile from "../SeeProfile/SeeProfile";
import logo from "../../assets/logo.png";

const SearchResults = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [weight, setWeight] = useState(searchParams.get("weight") || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    city: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [pendingCombats, setPendingCombats] = useState<any[]>([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      const { id } = JSON.parse(storedUser);
      getCombats({ status: "pending", user: id }).then((res) => {
        setPendingCombats(res.combats || []);
      });
    }
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      if (!city && !weight) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await searchUsers(city, weight);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    };
    doSearch();
  }, [city, weight]);

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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <img
                      src={user.profilePicture || logo}
                      alt={`Foto de perfil de ${user.name}`}
                      className="profile-image"
                      onClick={() =>
                        setEnlargedImage(user.profilePicture || logo)
                      }
                    />
                    <h3 style={{ margin: 0 }}>{user.name}</h3>
                  </div>
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
                    onClick={() => {
                      console.log("Usuario seleccionado:", user);
                      setSelectedUser(user);
                      setProfileModalOpen(true);
                    }}
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
                          navigate("/create-combat", {
                            state: combatState,
                          });
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
                  <button
                    className="see-video-btn"
                    onClick={() => {
                      console.log("Usuario:", user);
                      if (
                        user.boxingVideo &&
                        typeof user.boxingVideo === "string" &&
                        user.boxingVideo.trim() !== ""
                      ) {
                        setVideoModalUrl(user.boxingVideo);
                      } else {
                        setModalMsg("Este usuario no tiene vídeo subido.");
                        setModalOpen(true);
                      }
                    }}
                  >
                    {t("seeVideoButton")}
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="no-results">{t("noResultsFound")}</p>
        )}
      </div>
      {videoModalUrl && (
        <div
          className="video-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setVideoModalUrl(null)}
        >
          <div
            className="video-modal-content"
            style={{
              background: "#222",
              padding: 24,
              borderRadius: 10,
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalUrl(null)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 28,
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 2,
                lineHeight: 1,
              }}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ×
            </button>
            <video src={videoModalUrl} controls width={400} autoPlay />
          </div>
        </div>
      )}
      {enlargedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-modal-close-btn"
              onClick={() => setEnlargedImage(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <img src={enlargedImage} alt="Foto de perfil ampliada" />
          </div>
        </div>
      )}
      <SeeProfile
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedUser?._id || selectedUser?.id}
      />
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </div>
  );
};

export default SearchResults;
