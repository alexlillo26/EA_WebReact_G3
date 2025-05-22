import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getToken } from "../../services/authService"; // Added getToken import
import "./login.css";
import { useLanguage } from "../../context/LanguageContext";

const Login: React.FC<{
  onLogin: (user: { id: string; name: string }) => void;
}> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  console.log("Current language:", language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      console.log("Attempting login with email:", email);
      await login(email, password);
      const token = getToken();
      console.log("Token after login:", token);
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token payload:", decoded);
        const userData = {
          id: decoded.id,
          name: decoded.username,
        };
        onLogin(userData); // Update user state
        localStorage.setItem("userData", JSON.stringify(userData));
        navigate("/"); // Redirect to home
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(t("loginError"));
    }
  };

  const handleGoogleLogin = () => {
    const webReactOrigin = 'https://ea3-back.upc.edu'; // O window.location.origin si siempre es el mismo
    window.location.href =
      `https://ea3-api.upc.edu/api/auth/google?origin=${encodeURIComponent(webReactOrigin)}`;
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>{t("loginTitle")}</h2>
        {errorMessage && (
          <p style={{ color: "#ff4d4d", marginBottom: "15px" }}>
            {errorMessage}
          </p>
        )}
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t("loginButton")}</button>
      </form>
      <button onClick={handleGoogleLogin} className="loginGoogle">
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
        {t("googleLoginButton")}
      </button>
      <p>
        {t("noAccount")} <Link to="/register">{t("register")}</Link>
      </p>
    </div>
  );
};

export default Login;
