import React, { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../../context/LanguageContext";

const GymRegistration: React.FC = () => {
  const { t } = useLanguage();
  const [gymData, setGymData] = useState({
    name: "",
    email: "",
    phone: "",
    place: "",
    price: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGymData({ ...gymData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://ea3-api.upc.edu/api/gym", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gymData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(t("registrationSuccess"), result);
        alert(t("registrationSuccess"));
        setGymData({
          name: "",
          email: "",
          phone: "",
          place: "",
          price: "",
          password: "",
        }); // Limpia el formulario
      } else {
        console.error(t("registrationError"), response.statusText);
        alert(t("registrationError"));
      }
    } catch (error) {
      console.error(t("serverError"), error);
      alert(t("serverError"));
    }
  };

  return (
    <StyledRegistration>
      <div className="card">
        <h2>{t("gymRegistrationTitle")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            name="name"
            value={gymData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            name="email"
            value={gymData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder={t("phonePlaceholder")}
            name="phone"
            value={gymData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder={t("placePlaceholder")}
            name="place"
            value={gymData.place}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            placeholder={t("pricePlaceholder")}
            name="price"
            value={gymData.price}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            name="password"
            value={gymData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">{t("registerButton")}</button>
        </form>
      </div>
    </StyledRegistration>
  );
};

const StyledRegistration = styled.div`
  .flip-card__front {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card {
    background-color: rgba(
      26,
      26,
      26,
      0.9
    ); /* Fondo oscuro con transparencia */
    color: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    max-width: 400px; /* Limitar el ancho de la tarjeta */
    width: 100%; /* Asegurar que no exceda el ancho máximo */
    max-height: 600px;
    text-align: center;
  }

  h2 {
    margin-bottom: 20px;
    color: #d62828;
    font-size: 28px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 2px solid #2c2c2c;
    border-radius: 6px;
    font-size: 16px;
    background-color: #121212;
    color: white;
    transition: border-color 0.3s;
  }

  input:focus {
    border-color: #d62828;
    outline: none;
  }

  button {
    width: 100%;
    padding: 12px;
    background-color: #d62828;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #a31f1f;
  }
`;

export default GymRegistration;
