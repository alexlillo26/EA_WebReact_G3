import React, { useState } from "react";
import { registerUser } from "../../services/userService";
import { handleGoogleOAuth, login } from "../../services/authService";
import "./register.css";
import { useLanguage } from "../../context/LanguageContext";
import SimpleModal from "../SimpleModal/SimpleModal";

const Register: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !name ||
      !birthDate ||
      !email ||
      !password ||
      !weight ||
      !city ||
      !phone ||
      !gender
    ) {
      setModalMsg(t("allFieldsRequired"));
      setModalOpen(true);
      return;
    }

    if (!/^\d{9}$/.test(phone)) {
      setModalMsg(t("phoneError"));
      setModalOpen(true);
      return;
    }

    const passwwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwwordRegex.test(password)) {
      setModalMsg(t("passwordRequirements"));
      setModalOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalMsg(t("passwordsDoNotMatch"));
      setModalOpen(true);
      return;
    }

    try {
      const user = await registerUser({
        name,
        birthDate: new Date(birthDate),
        email,
        password,
        confirmPassword,
        weight,
        city,
        phone,
        gender,
      });

      if (user) {
        setModalMsg(t("registrationSuccess"));
        setModalOpen(true);
        await login(email, password);
        localStorage.setItem("userData", JSON.stringify(user));
        window.location.href = "/";
      } else {
        setModalMsg(t("registrationError"));
        setModalOpen(true);
      }
    } catch (error) {
      console.error(t("serverError"), error);
      setModalMsg(t("serverError"));
      setModalOpen(true);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const googleCode = new URLSearchParams(window.location.search).get(
        "code"
      );
      if (googleCode) {
        const userData = await handleGoogleOAuth(googleCode);
        setModalMsg(
          t("googleRegisterSuccess").replace("{name}", userData.name)
        );
        setModalOpen(true);
      } else {
        window.location.href =
          "https://ea3-api.upc.edu/api/auth/google?origin=webreact";
      }
    } catch (error) {
      console.error(t("googleRegisterError"), error);
      setModalMsg(t("googleRegisterError"));
      setModalOpen(true);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>{t("registerTitle")}</h2>
        {errorMessage && (
          <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>
            {errorMessage}
          </p>
        )}

        <input
          type="text"
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder={t("birthdatePlaceholder")}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">{t("genderPlaceholder")}</option>
          <option value="Hombre">{t("male")}</option>
          <option value="Mujer">{t("female")}</option>
        </select>
        <select
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        >
          <option value="">{t("weightPlaceholder")}</option>
          <option value="Peso pluma">{t("featherweight_kg")}</option>
          <option value="Peso medio">{t("middleweight_kg")}</option>
          <option value="Peso pesado">{t("heavyweight_kg")}</option>
        </select>
        <input
          type="text"
          placeholder={t("cityPlaceholder")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          password
        ) && password.length > 0 && (
          <p style={{ color: "#ff4d4d", marginTop: "0px" }}>
            {t("passwordReminder")}
          </p>
        )}
        <button type="submit">{t("registerButton")}</button>
      </form>
      <SimpleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
      />
    </div>
  );
};

export default Register;
