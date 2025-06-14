import React, { useState, useEffect } from 'react';
import CombatHistory from '../../components/CombatHistory/CombatHistory';
import GymCombatHistory from '../../components/CombatHistory/GymCombatHistory';
import { useLanguage } from '../../context/LanguageContext';
import { getToken } from '../../services/authService'; // Importa tu función getToken

const CombatHistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [loggedInUserBoxerId, setLoggedInUserBoxerId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGym, setIsGym] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user is a gym
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.isGym) {
          setIsGym(true);
        } else {
          setIsGym(false);
        }
      } else {
        setIsGym(false);
      }
    } catch {
      setIsGym(false);
    }
  }, []);

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
       {/* <h1>{t('statisticsTitle')}</h1> */}
      </header>
      <main>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        {!authError && isGym && <GymCombatHistory />}
        {!authError && !isGym && loggedInUserBoxerId && <CombatHistory />}
        {!loggedInUserBoxerId && !authError && getToken() === null && (
             <p>{t('combatHistory.errorUserNotLoggedIn')}</p>
        )}
      </main>
    </div>
  );
};

export default CombatHistoryPage;