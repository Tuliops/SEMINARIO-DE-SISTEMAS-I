// frontend/src/pages/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Asegúrate de importar Link
import styles from './Login.module.css';
import PopupMessage from '../components/PopupMessage';

const Register = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null); // Estado para la foto de perfil
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  // Función para manejar el cambio en el input de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Aquí podrías leer el archivo para mostrar una previsualización
      // Por ahora, solo guardamos el objeto File o una URL temporal
      setProfilePic(e.target.files[0]); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType('');

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return setMessageType('error');
    }

    try {
      // En un proyecto real, aquí subirías 'profilePic' a S3 y obtendrías una URL
      // Por ahora, simulamos una URL o enviamos el nombre del archivo
      const profilePicUrl = profilePic ? `url_to_uploaded_image/${profilePic.name}` : 'default_profile_pic.jpg';

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username, 
            fullName, 
            password, 
            confirmPassword,
            profilePic: profilePicUrl // Envía la URL simulada o el nombre del archivo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.mensaje || '¡Registro exitoso! Ahora puedes iniciar sesión.');
        setMessageType('success');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setMessage(data.mensaje || 'Error al registrar el usuario.');
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
      <PopupMessage 
        message={message} 
        type={messageType} 
        onClose={() => setMessage(null)}
      />
      
      <div className={styles.loginBox}>
        <h1>Registro de Usuario</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Nombre de Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Elige un nombre de usuario"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Nombre Completo:</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Introduce tu nombre completo"
              required
            />
          </div>

          {/* Campo para la foto de perfil */}
          <div className={styles.formGroup}>
            <label htmlFor="profilePic">Foto de Perfil:</label>
            <input
              type="file"
              id="profilePic"
              accept="image/*" // Solo acepta archivos de imagen
              onChange={handleFileChange}
            />
            {profilePic && (
                <p style={{marginTop: '10px', color: 'var(--text-color)', fontSize: '0.9em'}}>
                    Archivo seleccionado: {profilePic.name}
                </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Registrarme
          </button>
        </form>
        <p className={styles.registerLink}>
          ¿Ya tienes una cuenta? <Link to="/">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;