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
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

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
          <button onClick={() => alert(t("changeTheme"))}>
            {t("changeTheme")}
          </button>
        </li>
        <li>
          <button onClick={() => alert(t("highContrastMode"))}>
            {t("highContrastMode")}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AccessibilityMenu;
