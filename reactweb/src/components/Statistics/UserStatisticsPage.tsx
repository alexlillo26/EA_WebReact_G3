import React, { useEffect, useState } from "react";
import { fetchUserStatistics } from "../../services/statisticsService";
import { IUserStatistics } from "../../models/Combat";
import { useLanguage } from "../../context/LanguageContext";
import "./UserStatisticsPage.css";
import { RatingStars } from "../RatingStars/RatingStars";

type RatingAverages = {
  punctuality: number;
  attitude: number;
  intensity: number;
  sportmanship: number;
  technique: number;
};

const labels: Record<string, string> = {
  punctuality: "Puntualidad",
  attitude: "Actitud",
  intensity: "Intensidad",
  sportmanship: "Deportividad",
  technique: "Técnica",
};

const UserStatisticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<IUserStatistics | null>(null);
  const [ratingAverages, setRatingAverages] = useState<RatingAverages | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        if (user?.id) {
          fetchUserStatistics(user.id)
            .then((data) => {
              setStats(data);
              // Si el backend no devuelve ratingAverages, puedes calcularlos aquí si tienes ratings
              if ((data as any).ratingAverages) {
                setRatingAverages((data as any).ratingAverages);
              } else if (
                (data as any).ratings &&
                Array.isArray((data as any).ratings)
              ) {
                // Cálculo local si ratings está disponible
                const ratings = (data as any).ratings;
                const avg = (key: string) =>
                  ratings.length > 0
                    ? ratings.reduce(
                        (acc: number, r: any) => acc + Number(r[key] ?? 0),
                        0
                      ) / ratings.length
                    : 0;
                setRatingAverages({
                  punctuality: avg("punctuality"),
                  attitude: avg("attitude"),
                  intensity: avg("intensity"),
                  sportmanship: avg("sportmanship"),
                  technique: avg("technique"),
                });
              } else {
                setRatingAverages(null);
              }
            })
            .catch((err) => {
              console.error("Error fetching statistics:", err);
              const errorMessage =
                t("serverError" as any) ||
                "No se pudieron cargar las estadísticas.";
              setError(errorMessage);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setError("Hubo un problema al obtener tus datos de sesión.");
        setLoading(false);
      }
    } else {
      setError(t("combatHistory.errorUserNotLoggedIn" as any));
      setLoading(false);
    }
  }, [t]);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    const langCode = (t("languageCode" as any) || "es-ES") as string;
    return date.toLocaleString(langCode, { month: "long" });
  };

  if (loading) return <p className="stats-message">{t("loading" as any)}</p>;
  if (error) return <p className="stats-message error">{error}</p>;
  if (!stats)
    return <p className="stats-message">{t("userStats.noCombats" as any)}</p>;

  return (
    <div className="statistics-page-container">
      <h1>{t("userStats.title" as any)}</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h2>{t("userStats.frequentOpponent" as any)}</h2>
          {stats.mostFrequentOpponent ? (
            <p className="main-stat">
              {stats.mostFrequentOpponent.opponent.name}
              <span>
                ({stats.mostFrequentOpponent.count}{" "}
                {t("userStats.times" as any)})
              </span>
            </p>
          ) : (
            <p className="no-data">{t("userStats.noOpponent" as any)}</p>
          )}
        </div>
        <div className="stat-card">
          <h2>{t("userStats.frequentGyms" as any)}</h2>
          {stats.frequentGyms.length > 0 ? (
            <ul>
              {stats.frequentGyms.map((item) => (
                <li key={item.gym.id}>
                  {item.gym.name}{" "}
                  <span>
                    ({item.count} {t("userStats.times" as any)})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">{t("userStats.noGyms" as any)}</p>
          )}
        </div>
        <div className="stat-card full-width">
          <h2>{t("userStats.combatsPerMonth" as any)}</h2>
          {stats.combatsPerMonth.length > 0 ? (
            <ul>
              {stats.combatsPerMonth.map((item) => (
                <li key={`${item.year}-${item.month}`}>
                  <span className="month-year">
                    {getMonthName(item.month)} {item.year}:
                  </span>
                  <span className="month-count">
                    {item.count} {t("userStats.combats" as any)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">{t("userStats.noCombats" as any)}</p>
          )}
        </div>
      </div>
      {/* --- NUEVA SECCIÓN Valoraciones Medias --- */}
      {ratingAverages && (
        <div className="rating-averages-section">
          <h2
            style={{
              color: "var(--stats-accent-red)",
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {t("userStats.mySkills")}
          </h2>
          <ul className="rating-averages-list">
            {Object.entries(ratingAverages).map(([key, value]) => (
              <li key={key}>
                <span className="rating-label">{labels[key]}</span>
                <RatingStars value={Number(value) || 0} readOnly />
                <span
                  style={{ marginLeft: 8, color: "#e50914", fontWeight: 600 }}
                >
                  {Number(value).toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserStatisticsPage;
