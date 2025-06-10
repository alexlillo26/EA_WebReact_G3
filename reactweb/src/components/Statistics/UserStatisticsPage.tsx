import React, { useEffect, useState } from 'react';
import { fetchUserStatistics } from '../../services/statisticsService';
import { IUserStatistics } from '../../models/Combat';
import { useLanguage } from '../../context/LanguageContext';
import './UserStatisticsPage.css'; // No olvides crear este fichero (código más abajo)

const UserStatisticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<IUserStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtenemos los datos del usuario directamente del localStorage
    const storedUserData = localStorage.getItem('userData');
    
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        if (user?.id) {
          fetchUserStatistics(user.id)
            .then(data => {
              setStats(data);
            })
            .catch(err => {
              console.error('Error fetching statistics:', err);
              const errorMessage = t('serverError' as any) || 'No se pudieron cargar las estadísticas.';
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
        // Si no hay datos en localStorage, el usuario no ha iniciado sesión
        setError(t('combatHistory.errorUserNotLoggedIn' as any));
        setLoading(false);
    }
  }, [t]); // Dependemos de 't' para los mensajes de error

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    const langCode = (t('languageCode' as any) || 'es-ES') as string;
    return date.toLocaleString(langCode, { month: 'long' });
  };

  if (loading) return <p className="stats-message">{t('loading' as any)}</p>;
  if (error) return <p className="stats-message error">{error}</p>;
  if (!stats) return <p className="stats-message">{t('userStats.noCombats' as any)}</p>;

  return (
    <div className="statistics-page-container">
      <h1>{t('userStats.title' as any)}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{t('userStats.frequentOpponent' as any)}</h2>
          {stats.mostFrequentOpponent ? (
            <p className="main-stat">
              {stats.mostFrequentOpponent.opponent.name}
              <span>({stats.mostFrequentOpponent.count} {t('userStats.times' as any)})</span>
            </p>
          ) : (
            <p className="no-data">{t('userStats.noOpponent' as any)}</p>
          )}
        </div>

        <div className="stat-card">
          <h2>{t('userStats.frequentGyms' as any)}</h2>
          {stats.frequentGyms.length > 0 ? (
            <ul>
              {stats.frequentGyms.map(item => (
                <li key={item.gym.id}>
                  {item.gym.name} <span>({item.count} {t('userStats.times' as any)})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">{t('userStats.noGyms' as any)}</p>
          )}
        </div>

        <div className="stat-card full-width">
          <h2>{t('userStats.combatsPerMonth' as any)}</h2>
          {stats.combatsPerMonth.length > 0 ? (
             <ul>
               {stats.combatsPerMonth.map(item => (
                 <li key={`${item.year}-${item.month}`}>
                   <span className="month-year">{getMonthName(item.month)} {item.year}:</span>
                   <span className="month-count">{item.count} {t('userStats.combats' as any)}</span>
                 </li>
               ))}
             </ul>
          ) : (
            <p className="no-data">{t('userStats.noCombats' as any)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;