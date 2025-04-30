import React, { useState } from "react";
import styled from "styled-components";

const GymLogin: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9000/api/gym/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Inicio de sesión exitoso:", data);

        // Guarda el token en localStorage
        localStorage.setItem("gymToken", data.token);

        // Redirige al usuario a la página principal o dashboard
        alert("Inicio de sesión exitoso");
        window.location.href = "/"; // Cambia "/dashboard" por la ruta deseada
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setErrorMessage(
        "Error al conectar con el servidor. Por favor, inténtalo más tarde."
      );
    }
  };

  return (
    <StyledLogin>
      <div className="flip-card__front">
        <div className="card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo Electrónico"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Ingresar</button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </StyledLogin>
  );
};

const StyledLogin = styled.div`
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

export default GymLogin;
