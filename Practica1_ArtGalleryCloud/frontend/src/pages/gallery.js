// src/components/Gallery.jsx

import React, { useState, useEffect } from 'react';
import './Gallery.css'; 

const Gallery = () => {
    // El estado de las obras ahora es un array vacío inicialmente
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true); // El estado de carga es true al inicio
    const [error, setError] = useState(null); // Estado para manejar errores
    
    // Obtiene el token de sesión del almacenamiento local
    const sessionId = localStorage.getItem('sessionId');

    // Usamos useEffect para hacer la llamada a la API cuando el componente se monta
    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/gallery'); // Cambia la URL si es necesario
                if (!response.ok) {
                    throw new Error('Error al cargar la galería');
                }
                const data = await response.json();
                setArtworks(data);
            } catch (err) {
                console.error("Error fetching gallery:", err);
                setError("No se pudo cargar la galería. Por favor, inténtelo de nuevo.");
            } finally {
                setLoading(false); // Desactiva el estado de carga
            }
        };

        fetchGallery();
    }, []); // El array vacío asegura que esto solo se ejecute una vez al montar

    const handleAcquire = async (artworkId) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/acquire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`
                },
                body: JSON.stringify({ artworkId: artworkId })
            });

            const data = await response.json();

            if (response.ok) {
                // Actualiza la disponibilidad de la obra en el frontend
                setArtworks(prevArtworks =>
                    prevArtworks.map(art =>
                        art.id === artworkId ? { ...art, isAvailable: false } : art
                    )
                );
                alert(`¡Transacción exitosa! Nuevo saldo: $${data.newBalance}`);
            } else {
                alert(`Error al adquirir la obra: ${data.mensaje}`);
            }

        } catch (error) {
            console.error('Error de red o del servidor:', error);
            alert("Ocurrió un error al intentar la compra. Por favor, inténtelo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="loading-message">Cargando obras de arte...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="gallery-container">
            <h1 className="main-title">Galería de Arte</h1>
            <div className="artwork-grid">
                {artworks.map((artwork) => (
                    <div key={artwork.id} className="gallery-item">
                        <img src={artwork.image} alt={artwork.title} loading="lazy" />
                        <div className="item-content">
                            <h3>{artwork.title}</h3>
                            <p>Artista: {artwork.artist}</p>
                            <p>Precio: Q {String(artwork.price)}</p>
                            {/* Verifica la propiedad isAvailable de los datos de la API */}
                            {artwork.isAvailable ? (
                                <button
                                    className="acquire-button"
                                    onClick={() => handleAcquire(artwork.id)}
                                    disabled={loading}
                                >
                                    Adquirir
                                </button>
                            ) : (
                                <button className="acquire-button unavailable-button" disabled>
                                    Adquirida
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;