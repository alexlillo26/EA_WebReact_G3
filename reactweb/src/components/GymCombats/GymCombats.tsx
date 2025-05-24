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
          {combats.map((combat) => (
            <div key={combat._id} className="combat-card">
              <div className="combat-detail-row">
                <span className="combat-detail-label">Fecha:</span>
                <span className="combat-detail-value">{new Date(combat.date as string).toLocaleString()}</span>
              </div>
              <div className="combat-detail-row">
                <span className="combat-detail-label">Boxeadores:</span>
                <span className="combat-detail-value">
                  {Array.isArray((combat as any).boxers) && (combat as any).boxers.length > 0 ?
                    (combat as any).boxers.map((boxer: any) =>
                      typeof boxer === 'string' ? boxer : (boxer.name || boxer._id || '-')
                    ).join(' vs ') : '-'}
                </span>
              </div>
              <div className="combat-detail-row">
                <span className="combat-detail-label">Gimnasio:</span>
                <span className="combat-detail-value">
                  {(combat as any).gym && typeof (combat as any).gym === 'object'
                    ? ((combat as any).gym.name || (combat as any).gym._id)
                    : (typeof (combat as any).gym === 'string' ? (combat as any).gym : '-')}
                </span>
              </div>
              <div className="combat-detail-row">
                <span className="combat-detail-label">Nivel:</span>
                <span className="combat-detail-value">{combat.level || '-'}</span>
              </div>
              <div className="combat-detail-row">
                <span className="combat-detail-label">Visible:</span>
                <span className="combat-detail-value">{(combat as any).isHidden ? 'No' : 'Sí'}</span>
              </div>
            </div>
          ))}
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
