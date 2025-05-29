import React, { useEffect, useState, useCallback } from 'react';
import { fetchCombatHistory, FetchCombatHistoryReturn } from '../../services/combatService';
import { CombatHistoryEntry } from '../../models/Combat';
import { useLanguage } from '../../context/LanguageContext'; // Asumo que LanguageKey es el tipo de tus claves de traducción
import './CombatHistory.css'; // Asegúrate de que este archivo CSS exista y tenga los estilos necesarios

interface CombatHistoryProps {
  boxerId: string | null;
}

// Definimos el tipo específico para las claves de resultado que hemos añadido
// Esto es para que TypeScript sepa que estas son claves válidas.
// Asegúrate que estas coincidan EXACTAMENTE con las claves en tu translations.ts
type CombatResultTranslationKey = 
  | 'combatHistory.result.victoria'
  | 'combatHistory.result.derrota'
  | 'combatHistory.result.empate';

const CombatHistory: React.FC<CombatHistoryProps> = ({ boxerId }) => {
  // Asumimos que tu t() function está tipada para aceptar LanguageKey
  // y LanguageKey es la unión de todas tus claves de translations.ts
  const { t } = useLanguage();

  const [combats, setCombats] = useState<CombatHistoryEntry[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ... (otros estados sin cambios) ...
  const [totalCombats, setTotalCombats] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  // --- NUEVA FUNCIÓN HELPER PARA OBTENER LA CLAVE DE TRADUCCIÓN DEL RESULTADO ---
  const getResultTranslationKey = (resultValue: 'Victoria' | 'Derrota' | 'Empate'): CombatResultTranslationKey => {
    switch (resultValue.toLowerCase()) {
      case 'victoria':
        return 'combatHistory.result.victoria';
      case 'derrota':
        return 'combatHistory.result.derrota';
      case 'empate':
        return 'combatHistory.result.empate';
      default:
        // Esto no debería ocurrir si combat.result siempre es uno de los tres valores esperados
        // pero es bueno tener un fallback. Podrías retornar una clave genérica de error o la de empate.
        return 'combatHistory.result.empate';
    }
  };

  const loadCombatHistory = useCallback(async (pageToFetch: number) => {
    // ... (sin cambios en la lógica interna de loadCombatHistory)
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
  }, [boxerId, t, PAGE_SIZE]); // t ahora es dependencia de useCallback

  useEffect(() => {
    loadCombatHistory(currentPage);
  }, [boxerId, currentPage, loadCombatHistory]);

  // ... (handlePreviousPage, handleNextPage, y los returns de !boxerId, isLoading, error sin cambios) ...
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
    // No es necesario pasar _event si no lo usas
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
  };

  const handleNextPage = () => {
    // No es necesario pasar _event si no lo usas
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
                <p>
                  <strong>{t('combatHistory.result')}:</strong> 
                  {/* --- USA LA NUEVA FUNCIÓN HELPER AQUÍ --- */}
                  {t(getResultTranslationKey(combat.result))}
                </p>
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