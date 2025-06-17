import React, { useEffect, useState } from "react";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";
import "./GymList.css";
import { useLanguage } from "../../context/LanguageContext";

const GymList: React.FC = () => {
  const { t } = useLanguage();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { gyms, totalPages } = await getGyms(currentPage);
        setGyms(gyms);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error al obtener los gimnasios:", error);
      }
    };
    fetchGyms();
  }, [currentPage]);

  return (
    <div className="gym-list">
      <h2>{t("gymList.title")}</h2>
      <ul>
        {gyms
          .filter((gym) => !gym.isHidden)
          .map((gym) => (
            <li key={gym._id}>
              <strong>{gym.name}</strong> - {gym.place} (${gym.price})
            </li>
          ))}
      </ul>
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          {t("gymList.previous")}
        </button>
        <span>
          {t("gymList.page")} {currentPage} {t("gymList.of")} {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          {t("gymList.next")}
        </button>
      </div>
    </div>
  );
};

export default GymList;
