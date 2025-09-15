// src/components/PurchasedArt.jsx

import React, { useState, useEffect } from 'react';
import './PurchasedArt.css'; // Importa los estilos CSS para esta vista

const PurchasedArt = () => {
    const [purchasedArt, setPurchasedArt] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtiene el token de sesión del localStorage, asumiendo que el usuario ya inició sesión
    const sessionId = localStorage.getItem('sessionId');

    useEffect(() => {
        const fetchPurchasedArt = async () => {
            if (!sessionId) {
                setLoading(false);
                setError('Por favor, inicie sesión para ver sus obras.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/user/purchasedArt', {
                    method: 'GET',
                    headers: {
                                   'x-session-id': sessionId // Envía el sessionId en un encabezado

                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setPurchasedArt(data);
                } else {
                    setError(data.mensaje || 'Ocurrió un error al cargar las obras adquiridas.');
                }
            } catch (err) {
                console.error('Error de red:', err);
                setError('No se pudo conectar con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchPurchasedArt();
    }, [sessionId]);

    if (loading) {
        return <p className="loading-message">Cargando sus obras de arte...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="purchased-art-container">
            <h1 className="main-title">Mis Obras Adquiridas</h1>
            {purchasedArt.length === 0 ? (
                <p className="no-items-message">Aún no has adquirido ninguna obra de arte. ¡Explora la galería y encuentra tu favorita!</p>
            ) : (
                <div className="artwork-grid">
                    {purchasedArt.map((artwork) => (
                        <div key={artwork.id} className="gallery-item">
                            <img src={artwork.image} alt={artwork.title} loading="lazy" />
                            <div className="item-content">
                                <h3>{artwork.title}</h3>
                                <p>Artista: {artwork.artist}</p>
                                <button className="purchased-button" disabled>
                                    Adquirida
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchasedArt;