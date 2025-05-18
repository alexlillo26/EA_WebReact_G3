import React, { useEffect, useState } from "react";
import { getCurrentGym, updateGymProfile } from "../../services/gymService";
import { useLanguage } from "../../context/LanguageContext";
import { Gym } from "../../models/Gym";
import "./gym-profile.css";

const GymProfile: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gymData, setGymData] = useState({
    name: "",
    email: "",
    phone: "",
    place: "",
    price: "",
  });

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
        {error && <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>{error}</p>}
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
        <button type="submit">{t("saveButton")}</button>
      </form>
    </div>
  );
};

export default GymProfile;