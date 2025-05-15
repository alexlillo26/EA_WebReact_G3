import React, { useEffect, useState } from "react";
import { getCurrentGym, updateGymProfile } from "../../services/gymService";
import { useLanguage } from "../../context/LanguageContext";
import { Gym } from "../../models/Gym";
import styled from "styled-components";

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
        console.log("Gym data loaded:", data); // Debug log
        setGymData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          place: data.place || "",
          price: data.price?.toString() || "",
        });
      } catch (err) {
        console.error("Error loading gym data:", err);
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
      console.error("Error updating gym data:", err);
      alert(t("saveError"));
    }
  };

  if (loading) return <div>{t("loadingCombats")}</div>;

  return (
    <StyledProfile>
      <h2>{t("gymProfile")}</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t("nameLabel")}</label>
          <input
            type="text"
            name="name"
            value={gymData.name}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>{t("emailLabel")}</label>
          <input
            type="email"
            name="email"
            value={gymData.email}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>{t("phoneLabel")}</label>
          <input
            type="tel"
            name="phone"
            value={gymData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>{t("placePlaceholder")}</label>
          <input
            type="text"
            name="place"
            value={gymData.place}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label>{t("pricePlaceholder")}</label>
          <input
            type="text"
            name="price"
            value={gymData.price}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{t("saveButton")}</button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </StyledProfile>
  );
};

const StyledProfile = styled.div`
  max-width: 600px;
  margin: 80px auto;
  padding: 20px;
  background-color: #2a2a2a;
  border-radius: 8px;
  color: white;

  h2 {
    color: #d62828;
    text-align: center;
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    color: #d62828;
  }

  input {
    width: 100%;
    padding: 8px;
    background-color: #333;
    border: 1px solid #555;
    border-radius: 4px;
    color: white;
  }

  button {
    width: 100%;
    padding: 10px;
    background-color: #d62828;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
  }

  .error-message {
    color: #ff4444;
    margin-top: 10px;
  }
`;

export default GymProfile;
