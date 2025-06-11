import React, { createContext, useContext, useState } from "react";
import { translations } from "../translations/translations";

type Language = keyof typeof translations;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  // CAMBIO: La clave ahora es un string genérico para más flexibilidad
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("es");

  const t = (key: string) => {
    // Usamos 'any' de forma segura para buscar en el objeto de traducciones
    const langTranslations = translations[language] as any;
    
    // Si la clave existe, la devolvemos. Si no, devolvemos la propia clave como fallback.
    const translation = langTranslations[key];
    
    // Nos aseguramos de devolver siempre un string para evitar errores.
    return typeof translation === 'string' ? translation : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};