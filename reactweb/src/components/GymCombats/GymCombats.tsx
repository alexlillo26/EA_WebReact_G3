import React, { useEffect, useState } from 'react';
import { getGymCombats } from '../../services/combatService';
import { Combat } from '../../models/Combat';
import { useLanguage } from '../../context/LanguageContext';
import './GymCombats.css';

const GymCombats: React.FC = () => {
  const { t } = useLanguage();
  const [combats, setCombats] = useState<Combat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGymCombats = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setError('No user data found');
          return;
        }
        
        const { id } = JSON.parse(userData);
        const response = await getGymCombats(id, page);
        setCombats(response.combats);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (err) {
        setError(t('errorLoadingCombats'));
        setLoading(false);
      }
    };

    fetchGymCombats();
  }, [page, t]);

  if (loading) return <div>{t('loadingCombats')}</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="gym-combats-container">
      <h2>{t('gymCombats')}</h2>
      {combats.length > 0 ? (
        <div className="combats-list">
          {combats.map((combat) => {
            // Boxer names
            let boxerNames = '-';
            if (Array.isArray((combat as any).boxers) && (combat as any).boxers.length > 0) {
              boxerNames = (combat as any).boxers.map((boxer: any) =>
                typeof boxer === 'string' ? boxer : (boxer.name || boxer._id || '-')
              ).join(' vs ');
            }
            // Date/time
            const dateObj = combat.date ? new Date(combat.date as string) : null;
            const dateStr = dateObj ? dateObj.toLocaleDateString() : '-';
            const timeStr = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            // Estado
            const estado = combat.status ? (combat.status.charAt(0).toUpperCase() + combat.status.slice(1)) : '-';
            // Nivel
            const nivel = combat.level || '-';
            return (
              <div key={combat._id} className="combat-card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px', marginBottom: 22 }}>
                <div style={{ fontSize: 38, color: '#d62828', marginRight: 18 }}>
                  <i className="fas fa-drum-steelpan" style={{ fontSize: 38 }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 6 }}>{boxerNames}</div>
                  <div style={{ color: '#e0e0e0', fontSize: 15, marginBottom: 2 }}>Nivel: <span style={{ color: '#fff', fontWeight: 500 }}>{nivel}</span></div>
                  <div style={{ color: '#e0e0e0', fontSize: 15, marginBottom: 2 }}>Fecha: <span style={{ color: '#fff', fontWeight: 500 }}>{dateStr} {timeStr}</span></div>
                  <div style={{ color: '#e0e0e0', fontSize: 15 }}>Estado: <span style={{ color: '#fff', fontWeight: 500 }}>{estado}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>{t('noCombatsAvailable')}</p>
      )}
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => p - 1)} 
          disabled={page === 1}
        >
          {t('previousButton')}
        </button>
        <span>
          {t('pageLabel')} {page} {t('ofLabel')} {totalPages}
        </span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page === totalPages}
        >
          {t('nextButton')}
        </button>
      </div>
    </div>
  );
};

export default GymCombats;
