import React, { useState } from 'react';

const Hero = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        // Lógica para manejar la búsqueda
        console.log('Buscando:', searchTerm);
        // Aquí puedes llamar a la API para obtener los resultados
    };

    return (
        <div className="hero">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="input-search"
            />
            <button onClick={handleSearch} className="btn-search">Buscar</button>
        </div>
    );
};

export default Hero; 