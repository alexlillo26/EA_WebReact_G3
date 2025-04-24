import React, { useState } from "react";
import styled from "styled-components";

interface ProfileProps {
  user: {
    name: string;
    email?: string;
    phone?: string;
  } | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    weight: "", // Nuevo campo: peso
    location: "", // Nuevo campo: localidad
    birthdate: "", // Nuevo campo: fecha de nacimiento
    password: "", // Nuevo campo: contraseña
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  return (
    <StyledProfile>
      <h2>Perfil</h2>
      <div className="tabs">
        <button className="tab active">Editar perfil</button>
        <button className="tab">Editar contraseña</button>
      </div>
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
      </div>
    </StyledProfile>
  );
};
  

// Añadir peso, localidad, fecha de nacimiento, email y password 
   

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
    position: sticky; /* Fija los botones al fondo de la pantalla */
    bottom: 1000; /* Alinea al fondo */
    left: 0; /* Alinea al inicio horizontal */
    width: 90%; /* Ocupa todo el ancho */
    display: flex;
    justify-content: center;
    gap: 20px; /* Espaciado entre los botones */
    padding: 20px 0; /* Espaciado interno */
    background-color: rgba(26, 26, 26, 0.9); /* Fondo oscuro para los botones */

    .tab {
      background: none;
      border: 2px solid #d62828; /* Borde rojo */
      color: white;
      font-size: 18px; /* Tamaño de fuente más grande */
      padding: 15px 30px; /* Más espacio interno */
      cursor: pointer;
      border-radius: 5px; /* Bordes redondeados */
      transition: all 0.3s ease;
    }

    .tab.active {
      background-color: #d62828; /* Fondo rojo para el botón activo */
      color: white;
    }

    .tab:hover {
      background-color: #a31f1f; /* Fondo rojo oscuro al pasar el mouse */
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
`;
export default Profile;