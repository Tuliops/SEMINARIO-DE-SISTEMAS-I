import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import PopupMessage from '../components/PopupMessage'; // <-- Importa el componente
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null); // Estado para el mensaje del pop-up
    const [messageType, setMessageType] = useState(''); // Estado para el tipo de mensaje
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null); // Limpia cualquier mensaje anterior

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('sessionId', data.sessionId);
                setMessage('¡Bienvenido! Inicio de sesión exitoso.');
                setMessageType('success');

                // Retrasa la navegación para que el usuario pueda ver el pop-up
                setTimeout(() => {
                    navigate('/gallery');
                }, 3000);

            } else {
                setMessage(data.mensaje || 'Error al iniciar sesión.');
                setMessageType('error');
            }
        } catch (err) {
            console.error('Error de red o del servidor:', err);
            setMessage('No se pudo conectar con el servidor.');
            setMessageType('error');
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* El componente de pop-up se renderiza aquí */}
            <PopupMessage
                message={message}
                type={messageType}
                onClose={() => setMessage(null)} // Función para cerrar el pop-up
            />

            {/* El resto del código del formulario de login */}
            <div className={styles.loginBox}>
                <h1>Iniciar Sesión</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Nombre de Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Introduce tu nombre de usuario"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>
                        Entrar
                    </button>
                </form>
                <p className={styles.registerLink}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;