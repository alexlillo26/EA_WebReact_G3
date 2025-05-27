import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getUserById, updateUser } from "../../services/userService"; // Importa el servicio para actualizar el usuario
import { useLanguage } from "../../context/LanguageContext";
import SimpleModal from "../SimpleModal/SimpleModal"; // Importa el componente modal

interface ProfileProps {
  user: { id: string; name: string } | null; // Include user ID
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weight: "",
    city: "",
    birthdate: "",
    password: "",
    profilePicture: "",
    gender: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const fetchUserData = React.useCallback(async () => {
    // No uses el id del usuario pasado por props, siempre usa el autenticado
    try {
      const userData = await getUserById(); // Siempre obtiene el usuario autenticado
      if (userData) {
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          weight: userData.weight || "",
          city: userData.city || "",
          birthdate: userData.birthDate
            ? new Date(userData.birthDate).toISOString().split("T")[0]
            : "",
          password: "", // Do not prefill the password field
          profilePicture: userData.profilePicture || "",
          gender: userData.gender || "",
        });
        setPreviewImage(userData.profilePicture || null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [user]); // Depend on user to refetch when it changes

  useEffect(() => {
    fetchUserData(); // Fetch user data when the component mounts
  }, [fetchUserData]); // Only fetch once when the component mounts

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string); // Mostrar vista previa
      };
      reader.readAsDataURL(file);
      setProfilePictureFile(file); // Guardar el archivo para enviarlo al backend
    }
  };

  const handleSave = async () => {
    if (!user) return; // Ensure user is logged in
    try {
      const updatedUser = {
        ...formData,
        birthDate: new Date(formData.birthdate), // Convierte la fecha a formato Date
      };
      let result;
      if (profilePictureFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("profilePicture", profilePictureFile);

        // Añade todos los campos del usuario uno a uno al FormData
        Object.entries(updatedUser).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });

        result = await updateUser(user.id, formDataToSend);
      } else {
        result = await updateUser(user.id, updatedUser); // Llama al servicio para actualizar el usuario
      }
      if (!result) {
        setModalMsg(t("saveError"));
        setModalOpen(true);
        return;
      }
      setModalMsg(t("saveSuccess"));
      setModalOpen(true);
      await fetchUserData(); // Refresca los datos del usuario después de guardar
    } catch (error) {
      console.error(t("saveError"), error);
      setModalMsg(t("saveError"));
      setModalOpen(true);
    }
  };

  return (
    <StyledProfile>
      <h2>{t("profileTitle")}</h2>
      <div className="profile-picture">
        {previewImage ? (
          <img
            src={previewImage}
            alt={t("profilePictureLabel")}
            className="profile-img"
          />
        ) : (
          <p>{t("noProfilePicture")}</p>
        )}
        <label
          htmlFor="file-upload"
          className={`custom-file-upload ${previewImage ? "has-image" : ""}`}
        >
          {previewImage ? t("changeProfilePicture") : t("chooseProfilePicture")}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }} // Oculta el campo de entrada
        />
      </div>
      <div className="profile-details">
        <div className="detail">
          <label>{t("nameLabel")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("birthdateLabel")}</label>
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("emailLabel")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("genderLabel")}</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">{t("chooseGender")}</option>
            <option value="Hombre">{t("male")}</option>
            <option value="Mujer">{t("female")}</option>
          </select>
        </div>
        <div className="detail">
          <label>{t("weightLabel")}</label>
          <select name="weight" value={formData.weight} onChange={handleChange}>
            <option value="">{t("chooseWeight")}</option>
            <option value="Peso pluma">{t("featherweight_kg")}</option>
            <option value="Peso medio">{t("middleweight_kg")}</option>
            <option value="Peso pesado">{t("heavyweight_kg")}</option>
          </select>
        </div>
        <div className="detail">
          <label>{t("cityLabel")}</label>
          <input
            type="text"
            name="city" // ✅ Corregido de "location" a "city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className="detail">
          <label>{t("phoneLabel")}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <button className="save-button" onClick={handleSave}>
          {t("saveButton")}
        </button>
      </div>
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
      ;
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

      input,
      select {
        width: 100%; /* Ocupa todo el ancho disponible */
        background-color: #333;
        padding: 15px;
        border: 1px solid #555;
        border-radius: 5px;
        color: white;
        font-size: 16px;
      }

      input:focus,
      select:focus {
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
    display: block;
    margin-left: auto; /* Alinear a la derecha */
    margin-right: auto; /* Alinear a la derecha */
  }

  .save-button:hover {
    background-color: #a31f1f;
  }

  select {
    width: 100%;
    background-color: #333;
    padding: 15px;
    border: 1px solid #555;
    border-radius: 5px;
    color: white;
    font-size: 16px;
  }

  select:focus {
    outline: none;
    border-color: #d62828; /* Rojo principal */
  }

  .profile-picture {
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .profile-img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
    }

    input[type="file"] {
      display: block;
      margin: 0 auto;
    }
  }

  .custom-file-upload {
    display: inline-block;
    padding: 10px 20px;
    cursor: pointer;
    background-color: #d62828;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }

  .custom-file-upload.has-image {
    background-color: #a31f1f; /* Cambia el color cuando hay una imagen */
  }

  .custom-file-upload:hover {
    background-color: #a31f1f;
  }

  .custom-file-upload.has-image:hover {
    background-color: #388e3c; /* Cambia el color al pasar el mouse si hay una imagen */
  }
`;

export default Profile;
