import React, { useEffect, useState } from 'react';
import { getCombatsByBoxer, Combat } from '../../services/statisticsService';

interface StatisticsProps {
    boxerId: string; // ID del boxeador que ha iniciado sesión
}

const Statistics: React.FC<StatisticsProps> = ({ boxerId }) => {
    const [combats, setCombats] = useState<Combat[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('useEffect triggered with boxerId:', boxerId, 'and currentPage:', currentPage); // Log para verificar cuándo se ejecuta el useEffect

        const fetchCombats = async () => {
            console.log('Fetching combats for boxer:', boxerId, 'on page:', currentPage); // Log para verificar el ID del boxeador y la página actual
            try {
                setLoading(true);
                const combatsData = await getCombatsByBoxer(boxerId);
                setCombats(combatsData.combats);
                setTotalPages(1); // Solo 1 página
            } catch (err) {
                console.error('Error fetching combats:', err); // Log para capturar errores
                // EL ERROR SALTA AQUÍ
                setError('Error al cargar los COMBATESSS. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
                console.log('Finished fetching combats'); // Log para indicar que la solicitud ha terminado
            }
        };

        fetchCombats();
    }, [boxerId, currentPage]);

    if (loading) {
        console.log('Loading state is true'); // Log para verificar el estado de carga
        return <p>Cargando combates...</p>;
    }

    if (error) {
        console.error('Error state:', error); // Log para verificar el estado de error
        return <p>{error}</p>;
    }
    
    return (
        <div>
            <h2>Estadísticas</h2>
            <h3>Lista de Combates</h3>
            {combats.length > 0 ? (
                <ul>
                    {combats.map((combat) => (
                        <li key={combat.id}>
                            <strong>Fecha:</strong> {new Date(combat.date).toLocaleDateString()} <br />
                            <strong>Gimnasio:</strong> {combat.gym.name} <br />
                            <strong>Boxeadores:</strong> {combat.boxers.map((boxer) => boxer.name).join(', ')}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay combates disponibles.</p>
            )}
            <div>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                    Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default Statistics;