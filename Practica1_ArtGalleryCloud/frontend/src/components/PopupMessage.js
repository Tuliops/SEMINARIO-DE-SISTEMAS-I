import React from 'react';

const PopupMessage = ({ message, type, onClose }) => {
  if (!message) {
    return null;
  }

  // Estilos básicos para el pop-up
  const popupStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '8px',
    color: '#fff',
    zIndex: 2000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease-in-out',
    transform: message ? 'translateY(0)' : 'translateY(-100px)',
  };

  // Estilos basados en el tipo de mensaje (éxito o error)
  const successStyles = {
    backgroundColor: '#4CAF50', // Verde para éxito
  };

  const errorStyles = {
    backgroundColor: '#f44336', // Rojo para error
  };

  const finalStyles = {
    ...popupStyles,
    ...(type === 'success' ? successStyles : errorStyles),
  };

  // Ocultar el pop-up automáticamente después de 3 segundos
  setTimeout(() => {
    onClose();
  }, 3000);

  return (
    <div style={finalStyles}>
      {message}
    </div>
  );
};

export default PopupMessage;