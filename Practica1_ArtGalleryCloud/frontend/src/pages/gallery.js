// src/components/Gallery.jsx

import React, { useState } from 'react';


import './Gallery.css'; // Importa los estilos CSS
import { Await } from 'react-router-dom';

const initialArtworks = [
    {
        id: 1,
        isAvailable: true,
        title: "Noche estrellada",
        artist: "Vincent van Gogh",
        image: "https://tse1.mm.bing.net/th/id/OIP.m9JXrZObIzEXpuwUKx4rqQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        description: "Una de las obras más famosas de Van Gogh, pintada en 1889.",
        price : 100

    },
    {
        id: 2,
        isAvailable: true,
        title: "Dark Side Moon",
        artist: "Pink Floid",
        image: "https://tse4.mm.bing.net/th/id/OIP.CdQig4btMwmR0Kq5zSMhaQHaFB?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        description: " is the eighth studio LP by Pink Floyd. It was recorded at Abbey Road Studios in London, England, and released in 1973",
        price:200
    },
    {
        id: 4,
        isAvailable: true,
        title: "El grito",
        artist: "Edvard Munch",
        image: "https://angeladearte.wordpress.com/wp-content/uploads/2016/08/120503_exp_scream-ex-crop-rectangle3-large.jpg",
        description: "Una obra expresionista que simboliza la ansiedad humana.",
        price : 400
    },
    {
        id: 5,
        isAvailable: true,
        title: "La creación de Adán",
        artist: "	Miguel Ángel",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1200px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
        description: "La creación de Adán es un fresco en la bóveda de la Capilla Sixtina, pintado por Miguel Ángel alrededor del año 1511",
        price:1500
    }
];

const Gallery = () => {
    // Usamos el estado de React para manejar la lista de obras de arte
    const [artworks, setArtworks] = useState(initialArtworks);
    const [loading, setLoading] = useState(false);

    // token de sesión , que normalmente se obtendría del inicio de sesión
    const sessionId = localStorage.getItem('sessionId');

    const handleAcquire = async (artworkId) => {
        setLoading(true); // Activa el estado de carga
        console.log(artworkId);
        
        try {
            // Se realiza la llamada a tu endpoint de backend
            const response = await fetch('http://localhost:3000/api/acquire', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}` // Envía el token de sesión
                },
                
                body: JSON.stringify({ artworkId: artworkId }) // Envía el ID de la obra
            });


            const data = await response.json();

            if (response.ok) { // Verifica si el código de estado es 2xx
                // Si la compra es exitosa, actualizamos el estado de la obra en el frontend
                setArtworks(prevArtworks =>
                    prevArtworks.map(art =>
                        art.id === artworkId ? { ...art, isAvailable: false } : art
                    )
                );
                alert(`¡Transacción exitosa! Nuevo saldo: $${data.newBalance}`);
            } else {
                // Si hay un error (ej. saldo insuficiente), el backend enviará un mensaje
                alert(`Error al adquirir la obra: ${data.mensaje}`);
            }

        } catch (error) {
            console.error('Error de red o del servidor:', error);
            alert("Ocurrió un error al intentar la compra. Por favor, inténtelo de nuevo.");
        } finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };


    return (
        <div className="gallery-container">
            <h1 className="main-title">Galería de Arte</h1>
            {loading && <p className="loading-message">Procesando tu solicitud...</p>}
            <div className="artwork-grid">
                {artworks.map((artwork) => (
                    <div key={artwork.id} className="gallery-item">
                        <img src={artwork.image} alt={artwork.title} loading="lazy" />
                        <div className="item-content">
                            <h3>{artwork.title}</h3>
                            <p>Artista: {artwork.artist}</p>
                            <p>Precio: Q {String(artwork.price)}</p>
                            {artwork.isAvailable ? (
                                <button
                                    className="acquire-button"
                                    onClick={() => handleAcquire(artwork.id)}
                                    disabled={loading}
                                >
                                    Adquiri
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