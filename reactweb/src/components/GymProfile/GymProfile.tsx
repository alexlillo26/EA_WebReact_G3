import React, { useEffect, useState, useRef } from "react";
import {
  getCurrentGym,
  updateGymProfile,
  updateGymPhotos,
} from "../../services/gymService";
import { useLanguage } from "../../context/LanguageContext";
import { Gym } from "../../models/Gym";
import "./GymProfile.css";

const GymProfile: React.FC = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymData, setGymData] = useState({
    name: "",
    email: "",
    phone: "",
    place: "",
    price: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhoto, setMainPhoto] = useState<string>("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadGymData = async () => {
      try {
        const userData = localStorage.getItem("userData");
        if (!userData) {
          throw new Error("No user data found");
        }
        const data = await getCurrentGym();
        setGymData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          place: data.place || "",
          price: data.price?.toString() || "",
        });
        setPhotos(data.photos || []);
        setMainPhoto(data.mainPhoto || "");
      } catch (err) {
        setError(t("serverError"));
      } finally {
        setLoading(false);
      }
    };
    loadGymData();
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGymData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) {
        throw new Error("No user data found");
      }
      const { id } = JSON.parse(userData);
      const updatedGymData: Partial<Gym> = {
        ...gymData,
        price: Number(gymData.price),
      };
      await updateGymProfile(id, updatedGymData);
      alert(t("saveSuccess"));
    } catch (err) {
      alert(t("saveError"));
    }
  };

  if (loading) return <div>{t("loadingCombats")}</div>;

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>{t("gymProfile")}</h2>
        {error && (
          <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>{error}</p>
        )}
        <label className="input-label">{t("nameLabel")}</label>
        <input
          type="text"
          name="name"
          placeholder={t("nameLabel")}
          value={gymData.name}
          onChange={handleChange}
          required
        />
        <label className="input-label">{t("emailLabel")}</label>
        <input
          type="email"
          name="email"
          placeholder={t("emailLabel")}
          value={gymData.email}
          onChange={handleChange}
          required
        />
        <label className="input-label">{t("phoneLabel")}</label>
        <input
          type="tel"
          name="phone"
          placeholder={t("phoneLabel")}
          value={gymData.phone}
          onChange={handleChange}
          required
        />
        <label className="input-label">{t("placePlaceholder")}</label>
        <input
          type="text"
          name="place"
          placeholder={t("placePlaceholder")}
          value={gymData.place}
          onChange={handleChange}
          required
        />
        <label className="input-label">{t("pricePlaceholder")}</label>
        <input
          type="text"
          name="price"
          placeholder={t("pricePlaceholder")}
          value={gymData.price}
          onChange={handleChange}
          required
        />
        <label className="input-label">Fotos del gimnasio</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={async (e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              setPhotoFiles(files);
              const userData = localStorage.getItem("userData");
              if (!userData) return;
              const { id } = JSON.parse(userData);
              const formData = new FormData();
              files.forEach((file) => formData.append("photos", file));
              photos.forEach((url) => formData.append("oldPhotos", url));
              const res = await updateGymPhotos(id, formData);
              setPhotos(res.photos || []);
              setPhotoFiles([]);
            }
          }}
        />
        <button
          type="button"
          style={{ marginBottom: "12px" }}
          onClick={() => fileInputRef.current?.click()}
        >
          Subir fotos
        </button>
        <div className="gym-photos-preview" style={{ marginBottom: "12px" }}>
          {photos.map((url) => (
            <div
              key={url}
              className="gym-photo-item"
              style={{
                display: "inline-block",
                marginRight: 10,
                position: "relative",
              }}
              onMouseEnter={() => setHoveredPhoto(url)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <img
                src={url}
                alt="Foto del gimnasio"
                className={mainPhoto === url ? "main-photo" : ""}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  border:
                    mainPhoto === url ? "2px solid #0418f7" : "1px solid #ccc",
                  cursor: "pointer",
                }}
                onClick={() => setMainPhoto(url)}
              />
              {mainPhoto === url && (
                <span
                  style={{
                    position: "absolute",
                    background: "#0418f7",
                    color: "#fff",
                    fontSize: 12,
                    padding: "2px 6px",
                    borderRadius: 4,
                    top: 2,
                    left: 2,
                  }}
                >
                  Principal
                </span>
              )}
              {hoveredPhoto === url && (
                <button
                  type="button"
                  className="delete-photo-btn"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "#d62828",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 16,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const userData = localStorage.getItem("userData");
                    if (!userData) return;
                    const { id } = JSON.parse(userData);
                    const newPhotos = photos.filter((p) => p !== url);
                    await updateGymProfile(id, {
                      photos: newPhotos,
                      mainPhoto:
                        mainPhoto === url ? newPhotos[0] || "" : mainPhoto,
                    });
                    setPhotos(newPhotos);
                    if (mainPhoto === url) setMainPhoto(newPhotos[0] || "");
                  }}
                  title="Eliminar foto"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
        {mainPhoto && (
          <button
            type="button"
            className="save-main-photo-btn"
            style={{ marginBottom: "12px" }}
            onClick={async () => {
              const userData = localStorage.getItem("userData");
              if (!userData) return;
              const { id } = JSON.parse(userData);
              await updateGymProfile(id, { mainPhoto });
              alert("Foto principal actualizada");
            }}
          >
            Guardar foto principal
          </button>
        )}
        <button type="submit">{t("saveButton")}</button>
      </form>
    </div>
  );
};

export default GymProfile;
