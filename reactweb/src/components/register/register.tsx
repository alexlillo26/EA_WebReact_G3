import React, { useState } from "react";
import { registerUser } from "../../services/userService";
import { handleGoogleOAuth, login } from "../../services/authService";
import "./register.css";
import { useLanguage } from "../../context/LanguageContext";

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
      setErrorMessage(t("allFieldsRequired"));
      return;
    }

    if (!/^\d{9}$/.test(phone)) {
      setErrorMessage("El teléfono debe tener 9 dígitos.");
      return;
    }

    if (!/^\d{9}$/.test(phone)) {
      setErrorMessage("El teléfono debe tener 9 dígitos.");
      return;
    }

    const passwwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwwordRegex.test(password)) {
      setErrorMessage(t("passwordRequirements"));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t("passwordsDoNotMatch"));
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
        alert(t("registrationSuccess"));
        // Inicia sesión automáticamente
        await login(email, password);
        localStorage.setItem(
          "userData",
          JSON.stringify({ id: user.id, name: user.name })
        );
        window.location.href = "/"; // Redirige al inicio
      } else {
        setErrorMessage(t("registrationError"));
      }
    } catch (error) {
      console.error(t("serverError"), error);
      setErrorMessage(t("serverError"));
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const googleCode = new URLSearchParams(window.location.search).get(
        "code"
      );
      if (googleCode) {
        const userData = await handleGoogleOAuth(googleCode);
        alert(t("googleRegisterSuccess").replace("{name}", userData.name));
      } else {
        window.location.href =
          "http://ea3-api.upc.edu/api/auth/google?origin=webreact";
      }
    } catch (error) {
      console.error(t("googleRegisterError"), error);
      alert(t("googleRegisterError"));
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
        ) &&
          password.length > 0 && (
            <p style={{ color: "#ff4d4d", marginTop: "0px" }}>
              {t("passwordReminder")}
            </p>
          )}
        <button type="submit">{t("registerButton")}</button>
      </form>
      <button onClick={handleGoogleRegister} className="registerGoogle">
        <svg
          viewBox="0 0 256 262"
          preserveAspectRatio="xMidYMid"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            fill="#4285F4"
          ></path>
          <path
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            fill="#34A853"
          ></path>
          <path
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            fill="#FBBC05"
          ></path>
          <path
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            fill="#EB4335"
          ></path>
        </svg>
        {t("googleRegisterButton")}
      </button>
    </div>
  );
};

export default Register;
