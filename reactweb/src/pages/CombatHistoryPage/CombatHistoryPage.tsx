import React, { useState, useEffect } from 'react';
import CombatHistory from '../../components/CombatHistory/CombatHistory';
import { useLanguage } from '../../context/LanguageContext';
import { getToken } from '../../services/authService'; // Importa tu función getToken

const CombatHistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [loggedInUserBoxerId, setLoggedInUserBoxerId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = getToken(); // Obtiene el token
      if (token) {
        // Decodifica el token para obtener el ID del payload
        // El payload es la segunda parte del JWT (índice 1)
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          // Asumimos que el ID del usuario en el payload del token se llama 'id'
          // (igual que en tu userService.ts)
          if (decodedPayload && decodedPayload.id) {
            setLoggedInUserBoxerId(decodedPayload.id);
          } else {
            console.error("CombatHistoryPage: No se encontró 'id' en el payload del token decodificado.");
            setAuthError(t('combatHistory.errorTokenInvalid'));
          }
        } else {
          console.error("CombatHistoryPage: Payload del token no encontrado.");
          setAuthError(t('combatHistory.errorTokenCorrupt'));
        }
      } else {
        // No hay token, el usuario no está logueado o el token no se encontró
        console.log("CombatHistoryPage: No token found. User might not be logged in.");
        setAuthError(t('combatHistory.errorUserNotLoggedIn'));
      }
    } catch (e) {
      console.error("CombatHistoryPage: Error decodificando el token o obteniendo el ID.", e);
      setAuthError(t('combatHistory.errorTokenProcessing'));
    }
  }, [t]); // t es dependencia si se usa en los mensajes de error

  return (
    <div className="page-container combat-history-page">
      <header>
        <h1>{t('statisticsTitle')}</h1> {/* Asume que 'statisticsTitle' está en translations.ts */}
      </header>
      <main>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        
        {!authError && loggedInUserBoxerId && (
          <CombatHistory boxerId={loggedInUserBoxerId} />
        )}
        
        {/* Si no hay authError pero loggedInUserBoxerId sigue siendo null después del useEffect (y no hubo error de token),
            podría ser que el token no tuviera ID. El mensaje de authError ya cubriría esto.
            Si quieres un mensaje específico para cuando no hay token y no es un error de decodificación:
        */}
        {!loggedInUserBoxerId && !authError && getToken() === null && (
             <p>{t('combatHistory.errorUserNotLoggedIn')}</p>
        )}
      </main>
    </div>
  );
};

export default CombatHistoryPage;