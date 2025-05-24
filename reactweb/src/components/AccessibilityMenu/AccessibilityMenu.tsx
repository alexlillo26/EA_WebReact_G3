import React, { useRef, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations/translations";
import "./AccessibilityMenu.css"; // Opcional: estilos específicos para el menú

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, setLanguage, language } = useLanguage();
  const [isDyslexiaMode, setIsDyslexiaMode] = React.useState(false);
  const [isADHDMode, setIsADHDMode] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const activateMode = (mode: "dyslexia" | "adhd") => {
    // Si el modo seleccionado ya está activo, desactívalo
    if (
      (mode === "dyslexia" && isDyslexiaMode) ||
      (mode === "adhd" && isADHDMode)
    ) {
      document.body.classList.remove("dyslexia-mode", "adhd-mode");
      setIsDyslexiaMode(false);
      setIsADHDMode(false);
      return;
    }

    // Desactivar todos los modos
    document.body.classList.remove("dyslexia-mode", "adhd-mode");
    setIsDyslexiaMode(false);
    setIsADHDMode(false);

    // Activar el modo seleccionado
    if (mode === "dyslexia") {
      document.body.classList.add("dyslexia-mode");
      setIsDyslexiaMode(true);
    } else if (mode === "adhd") {
      document.body.classList.add("adhd-mode");
      setIsADHDMode(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isDyslexiaMode) {
        document.documentElement.style.setProperty(
          "--cursor-y",
          `${event.clientY}px`
        );
      }
    };

    if (isDyslexiaMode) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDyslexiaMode]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isADHDMode) {
        document.documentElement.style.setProperty(
          "--cursor-y",
          `${event.clientY}px`
        );
      }
    };

    if (isADHDMode) {
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isADHDMode]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={panelRef}
      className={`accessibility-panel ${isOpen ? "open" : ""}`}
    >
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <h2>{t("accessibilityOptions")}</h2>
      <ul>
        <li>
          <div className="language-selector">
            {["es", "ca", "eu", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  console.log("Language changed to:", lang);
                  setLanguage(lang as keyof typeof translations);
                }}
                className={language === lang ? "selected" : ""}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </li>
        <li>
          <label>
            {t("dyslexiaModeLabel" as any)}
            <div className="checkbox-wrapper-8">
              <input
                type="checkbox"
                id="dyslexia-toggle"
                className="tgl tgl-skewed"
                checked={isDyslexiaMode}
                onChange={() => activateMode("dyslexia")}
              />
              <label
                htmlFor="dyslexia-toggle"
                data-tg-on="ON"
                data-tg-off="OFF"
                className="tgl-btn"
              ></label>
            </div>
          </label>
        </li>
        <li>
          <label>
            {t("adhdModeLabel" as any)}
            <div className="checkbox-wrapper-8">
              <input
                type="checkbox"
                id="adhd-toggle"
                className="tgl tgl-skewed"
                checked={isADHDMode}
                onChange={() => activateMode("adhd")}
              />
              <label
                htmlFor="adhd-toggle"
                data-tg-on="ON"
                data-tg-off="OFF"
                className="tgl-btn"
              ></label>
            </div>
          </label>
        </li>
      </ul>
    </div>
  );
};

export default AccessibilityMenu;
