import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import { StepsSectionGym } from "../StepsSection/SteptsSection";
import AboutSection from "../AboutSection/AboutSection";
import GymMap from "../Geolocalization/GymMap";
import { AppPromoSectionGym } from "../AppPromoSection/AppPromoSection";
import "./Home.css";
import { useLanguage } from "../../context/LanguageContext";

const HomeGym: React.FC = () => {
  const { t } = useLanguage();
  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await getGyms();
        setGyms(response.gyms);
      } catch (error) {
        // No-op for gym home
      }
    };
    fetchGyms();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a tu panel de gimnasio</h1>
          <p>
            Gestiona tus combates, consulta estadísticas y mantén tu información
            actualizada.
          </p>
        </div>
      </section>
      <StepsSectionGym />
      <AboutSection />
      <GymMap gyms={gyms} />
      <AppPromoSectionGym />
    </>
  );
};

export default HomeGym;
