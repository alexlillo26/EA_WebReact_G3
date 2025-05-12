import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchUsers } from '../../services/userService';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const [city, setCity] = useState(queryParams.get('city') || '');
  const [weight, setWeight] = useState(queryParams.get('weight') || '');
  const [level, setLevel] = useState(queryParams.get('level') || '');
  const [searchResults, setSearchResults] = useState(location.state?.results || []);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!city && !weight) {
      setError("Por favor, introduce al menos un criterio de búsqueda");
      return;
    }

    try {
      const results = await searchUsers(city, weight);
      setSearchResults(results);
      const searchParams = new URLSearchParams();
      if (city) searchParams.set('city', city);
      if (weight) searchParams.set('weight', weight);
      if (level) searchParams.set('level', level);
      navigate(`/search-results?${searchParams.toString()}`, { 
        state: { results },
        replace: true
      });
    } catch (err) {
      setError("Error al realizar la búsqueda");
      setSearchResults([]);
    }
  };

  return (
    <div className="search-results-container">
      <div className="search-bar-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <select value={weight} onChange={(e) => setWeight(e.target.value)}>
            <option value="">Categoría de peso</option>
            <option value="Peso pluma">Peso pluma</option>
            <option value="Peso medio">Peso medio</option>
            <option value="Peso pesado">Peso pesado</option>
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Nivel</option>
            <option value="Amateur">Amateur</option>
            <option value="Profesional">Profesional</option>
            <option value="Sparring">Sparring</option>
          </select>
          <button type="submit">Buscar</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
      
      <div className="results-container">
        {searchResults.length > 0 ? (
          searchResults.map((user: any) => (
            <div key={user.id} className="result-card">
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>Ciudad: {user.city}</p>
                <p>Peso: {user.weight}</p>
                <p>Nivel: {user.level}</p>
              </div>
              <button className="contact-button">Contactar</button>
            </div>
          ))
        ) : (
          <p className="no-results">No se encontraron resultados</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;