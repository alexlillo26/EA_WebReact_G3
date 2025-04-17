import React from 'react';
import './Home.css';

const Home: React.FC = () => (
  <section className="hero">
    <div className="hero-content">
      <h1>Organiza y encuentra combates de Boxeo al instante</h1>
      <p>
        Conecta con rivales, promotores y gimnasios. Participa en peleas equilibradas, 
        entrena con los mejores y escala en el ranking.
      </p>
      <form className="search-form">
        <input type="text" placeholder="Ciudad, gimnasio o boxeador" />
        <select>
          <option value="amateur">Amateur</option>
          <option value="profesional">Profesional</option>
          <option value="sparring">Sparring</option>
        </select>
        <input type="date" />
        <select>
          <option value="peso-pluma">Peso pluma</option>
          <option value="peso-medio">Peso medio</option>
          <option value="peso-pesado">Peso pesado</option>
        </select>
        <button type="submit" className="search-button">Buscar Combate</button>
      </form>
    </div>
  </section>
);

export default Home;