import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css'; // Importa los estilos

const Navbar = () => {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('sessionId'); // Obtiene el ID de sesión

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: sessionId }), // Envía el sessionId al backend
      });

      if (response.ok) {
        localStorage.removeItem('sessionId'); // Elimina el ID de sesión del almacenamiento local
        navigate('/'); // Redirige al login
      } else {
        console.error('Error al cerrar sesión:', await response.json());
        alert('No se pudo cerrar sesión. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error de red al cerrar sesión:', error);
      alert('Error de conexión al cerrar sesión.');
    }
  };

  return (
    <nav className={styles.navbar}>
      <h1 className={styles.navbarTitle} onClick={() => navigate(sessionId ? '/gallery' : '/')}>
        ART GALLERY CLOUD
      </h1>

      <div className={styles.navLinks}>
        {sessionId ? ( // Si hay un sessionId, el usuario está logueado
          <>
            <Link to="/gallery">Galería</Link>
            <Link to="/profile">Perfil</Link>
            <Link to="/purchased-art">Obras Adquiridas</Link> {/* Ruta para obras adquiridas */}
            <Link to="/edit-profile">Editar Perfil</Link> {/* Ruta para editar perfil */}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </>
        ) : ( // Si no hay sessionId, el usuario no está logueado
          <>
            <Link to="/">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;