import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getUserById } from "../../services/userService";

interface ProfileProps {
  user: { id: string; name: string } | null; // Include user ID
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weight: "",
    location: "",
    birthdate: "",
    password: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return; // Ensure user is logged in
      try {
        const storedData = localStorage.getItem(`profileData_${user.id}`); // Use user ID for unique storage
        if (storedData) {
          setFormData(JSON.parse(storedData));
        } else {
          const userData = await getUserById();
          const initialData = {
            name: userData?.name || "",
            email: userData?.email || "",
            phone: userData?.phone || "",
            weight: "",
            location: "",
            birthdate: "",
            password: "",
          };
          setFormData(initialData);
          localStorage.setItem(`profileData_${user.id}`, JSON.stringify(initialData)); // Store data uniquely
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return; // Ensure user is logged in
    console.log("Saving user data:", formData);
    localStorage.setItem(`profileData_${user.id}`, JSON.stringify(formData)); // Save data uniquely
    alert("Cambios guardados exitosamente.");
  };

  return (
    <StyledProfile>
      <h2>Perfil</h2>
      <div className="profile-details">
        <div className="detail">
          <label>Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Peso (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Localidad</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button className="save-button" onClick={handleSave}>
          Guardar Cambios
        </button>
      </div>
    </StyledProfile>
  );
};

const StyledProfile = styled.div`
  width: 100vw; /* Ocupa todo el ancho de la ventana */
  height: 100vh; /* Ocupa todo el alto de la ventana */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Alinea el contenido al inicio */
  align-items: center;
  background-color: rgba(26, 26, 26, 0.9); /* Fondo oscuro */
  color: white;
  position: relative; /* Necesario para posicionar elementos hijos absolutamente */

  h2 {
    text-align: center;
    margin-bottom: 20px;
    margin-top: 90px; /* Espacio desde la parte superior */
    font-size: 24px; /* Tamaño de fuente más grande */
    color: #d62828; /* Rojo principal */
  }

  .tabs {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px 0;
    background-color: rgba(26, 26, 26, 0.9);

    .tab {
      background: none;
      border: 2px solid #d62828;
      color: white;
      font-size: 18px;
      padding: 15px 30px;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
      height: 50px; /* Asegurar altura uniforme */
      display: flex;
      align-items: center; /* Centrar contenido verticalmente */
      justify-content: center; /* Centrar contenido horizontalmente */
    }

    .tab.active {
      background-color: #d62828;
      color: white;
    }

    .tab:hover {
      background-color: #a31f1f;
      border-color: #a31f1f;
    }
  }

  .profile-details {
    width: 90%; /* Ocupa todo el ancho */
    padding: 0 20px; /* Espaciado lateral */
    margin-top: 20px; /* Espaciado desde la cabecera */
    margin-bottom: 80px; /* Espacio para evitar que el contenido se solape con los botones */
    
    .detail {
      margin-bottom: 15px;

      label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
        color: #d62828; /* Rojo principal */
      }

      input {
        width: 100%; /* Ocupa todo el ancho disponible */
        background-color: #333;
        padding: 15px;
        border: 1px solid #555;
        border-radius: 5px;
        color: white;
        font-size: 16px;
      }

      input:focus {
        outline: none;
        border-color: #d62828; /* Rojo principal */
      }
    }
  }

  .save-button {
    background-color: #d62828;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px;
  }

  .save-button:hover {
    background-color: #a31f1f;
  }
`;

export default Profile;