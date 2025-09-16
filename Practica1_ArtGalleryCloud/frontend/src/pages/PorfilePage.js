import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    currentPassword: '', // Para validar cambios
    profilePic: null, // Cambiado a 'null' para guardar el objeto File
    balance: 0
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    // Para mostrar la Informacion del Usuario Logueado
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');

        if (!sessionId) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:3000/api/user/profile', {
          method: 'GET',
          headers: {
            'x-session-id': sessionId // Envía el sessionId en un encabezado
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setFormData({
            username: userData.username,
            fullName: userData.fullName,
            password: '', 
            currentPassword: '',
            profilePic: userData.profilePic, // Mantén la URL de la imagen actual
            balance: parseFloat(userData.balance)
          });
          setPreviewImage(userData.profilePic || '');
        } else {
          console.error('Error al cargar datos del usuario');
          setError('No se pudieron cargar los datos del perfil');
        }
      } catch (error) {
        console.error('Error de red:', error);
        setError('Error de conexión al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Para Ingresar Cambios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Cambio de Imagen de Perfil 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Guarda el objeto 'File' en el estado para enviarlo al backend
      setFormData({
        ...formData,
        profilePic: file 
      });

      // Muestra una vista previa de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Si se realizan Cambios
  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.username || !formData.fullName) {
        setError('Nombre de usuario y nombre completo son obligatorios.');
        return;
      }

      if (!formData.currentPassword) {
        setError('Debe ingresar su contraseña actual para confirmar los cambios.');
        return;
      }

      const sessionId = localStorage.getItem('sessionId');
      
      // Crea un objeto FormData para enviar datos y archivos
      const requestBody = new FormData();
      requestBody.append('username', formData.username);
      requestBody.append('fullName', formData.fullName);
      requestBody.append('currentPassword', formData.currentPassword);
      
      // Añade el campo de nueva contraseña solo si tiene un valor
      if (formData.password) {
        requestBody.append('newPassword', formData.password);
      }
      
      // Si `profilePic` es un objeto File, lo añade al FormData
      if (formData.profilePic instanceof File) {
        requestBody.append('profilePic', formData.profilePic);
      }
      // Nota: El nombre 'profilePic' aquí debe coincidir con `upload.single('profilePic')` en tu backend.

      const response = await fetch('http://localhost:3000/api/user/edit-profile', {
        method: 'PUT',
        headers: {
          // No se necesita 'Content-Type', el navegador lo establece automáticamente con FormData
          'Authorization': `Bearer ${sessionId}`
        },
        body: requestBody // Envía el FormData directamente
      });

      if (response.ok) {
        const result = await response.json();
        setEditMode(false);
        setSuccess('Perfil actualizado correctamente.');
        setTimeout(() => setSuccess(''), 3000);

        setFormData({
          ...formData,
          password: '',
          currentPassword: '',
          profilePic: result.user.profilePic // Actualiza la URL de la imagen si se cambió
        });
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setError('Error de conexión al guardar los cambios');
    }
  };

  // El resto del código del componente es el mismo...
  
  // Aumentar Saldo del Usuario
  const handleAddBalance = async () => {
    const amount = parseFloat(prompt('¿Cuánto saldo deseas agregar?'));

    if (isNaN(amount) || amount <= 0) {
      setError('Monto inválido. Debe ser un número positivo.');
      return;
    }

    const password = prompt('Para confirmar, ingresa tu contraseña:');

    if (!password) {
      setError('Operación cancelada. Debes ingresar la contraseña.');
      return;
    }

    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/user/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ amount, password })
      });

      if (response.ok) {
        const result = await response.json();
        setFormData({
          ...formData,
          balance: parseFloat(result.newBalance)
        });
        setSuccess(`Se agregaron Q${amount} a tu saldo.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al agregar saldo');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setError('Error de conexión al agregar saldo');
    }
  };

  // Para Cerrar Sesion del Usuario
  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'GET',
        headers: {
          'x-session-id': sessionId
        },
      });

      if (response.ok) {
        localStorage.removeItem('sessionId');
        navigate('/');
      } else {
        console.error('Error al cerrar sesión:', await response.json());
        alert('No se pudo cerrar sesión. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error de red al cerrar sesión:', error);
      alert('Error de conexión al cerrar sesión.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h2>Mi Perfil</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        <div className={styles.profileHeader}>
          <div className={styles.imageContainer}>
            <img
              src={previewImage || '/default-avatar.png'}
              alt="Profile"
              className={styles.profileImage}
            />
            {editMode && (
              <div className={styles.imageOverlay}>
                <label htmlFor="imageUpload" className={styles.uploadLabel}>
                  Cambiar imagen
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
              </div>
            )}
          </div>
          <div className={styles.balanceSection}>
            <h3>Saldo actual</h3>
            <p className={styles.balance}>Q{formData.balance?.toFixed(2) || '0.00'}</p>
            <button
              onClick={handleAddBalance}
              className={styles.addBalanceBtn}
            >
              Aumentar saldo
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="username">Nombre de usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!editMode}
            className={editMode ? styles.editable : styles.disabled}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Nombre completo</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={!editMode}
            className={editMode ? styles.editable : styles.disabled}
          />
        </div>
        {editMode && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="password">Nueva contraseña (opcional)</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Dejar en blanco para mantener la actual"
                className={styles.editable}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Contraseña actual *</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Necesaria para confirmar cambios"
                className={styles.editable}
              />
            </div>
          </>
        )}
        <div className={styles.buttonGroup}>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className={styles.saveBtn}
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setEditMode(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className={styles.editBtn} 
              >
                Editar perfil
              </button>
              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;