import React, { useEffect, useState, useCallback } from 'react';
// Se elimina la importación de 'setCombatResult'
import { fetchCombatHistory, FetchCombatHistoryReturn } from '../../services/combatService';
import { CombatHistoryEntry } from '../../models/Combat';
import { useLanguage } from '../../context/LanguageContext';
import './CombatHistory.css';

interface CombatHistoryProps {
  boxerId: string | null;
}

// Ya no necesitamos las funciones getResultClass ni getResultTranslationKey

const CombatHistory: React.FC<CombatHistoryProps> = ({ boxerId }) => {
  const { t } = useLanguage();
  const [combats, setCombats] = useState<CombatHistoryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCombats, setTotalCombats] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const loadCombatHistory = useCallback(async (pageToFetch: number) => {
    if (!boxerId) {
      setCombats([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalCombats(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data: FetchCombatHistoryReturn = await fetchCombatHistory(boxerId, pageToFetch, PAGE_SIZE);
      setCombats(data.combats);
      setTotalPages(data.totalPages > 0 ? data.totalPages : 1);
      setCurrentPage(data.currentPage);
      setTotalCombats(data.totalCombats);
    } catch (err: any) {
      setError(t('combatHistory.errorLoading'));
      setCombats([]);
      setTotalPages(1);
      setTotalCombats(0);
    } finally {
      setIsLoading(false);
    }
  }, [boxerId, t, PAGE_SIZE]);

  useEffect(() => {
    loadCombatHistory(currentPage);
  }, [boxerId, currentPage, loadCombatHistory]);

  // Ya no necesitamos la función handleSetResult

  if (!boxerId) {
    return <p>{t('combatHistory.noUserSelected')}</p>;
  }
  if (isLoading) {
    return <p>{t('combatHistory.loading')}</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1));
  };

  return (
    <div className="combat-history-container">
      <h3>{t('combatHistory.title')}</h3>
      {combats.length === 0 && !isLoading && (
        <p>{t('combatHistory.noCombats')}</p>
      )}
      {combats.length > 0 && (
        <>
          <ul>
            {combats.map((combat) => (
              <li key={combat._id} className="combat-history-item">
                <p>
                  <strong>{t('combatHistory.date')}:</strong> {new Date(combat.date).toLocaleDateString()} - {combat.time}
                </p>
                {combat.opponent && (
                  <p>
                    <strong>{t('combatHistory.opponent')}:</strong> {combat.opponent.username}
                  </p>
                )}
                {/* Se elimina el párrafo que mostraba el resultado */}
                {combat.gym && combat.gym.name && (
                  <p>
                    <strong>{t('combatHistory.gym')}:</strong> {combat.gym.name}
                  </p>
                )}
                {combat.level && (
                  <p>
                    <strong>{t('combatHistory.level')}:</strong> {combat.level}
                  </p>
                )}
                {/* Se elimina la sección de botones para asignar resultado */}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                {t('combatHistory.previousPage')}
              </button>
              <span>
                {t('combatHistory.page')} {currentPage} {t('combatHistory.of')} {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                {t('combatHistory.nextPage')}
              </button>
            </div>
          )}
          <p>{t('combatHistory.totalCombatsLabel')} {totalCombats}</p>
        </>
      )}
    </div>
  );
};

export default CombatHistory;