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
    profilePic: '',
    balance: 0
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario desde el backend
  useEffect(() => {

    //Para mostrar la Informacion del Usuario Logueado
    const fetchUserData = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');


        if (!sessionId) {
          navigate('/');
          return;
        }

        const response = await fetch('http://localhost:3000/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })

        });

        console.log(response)
        if (response.ok) {
          const userData = await response.json();
          setFormData({
            username: userData.username,
            fullName: userData.fullName,
            password: '', // No cargamos la contraseña por seguridad
            currentPassword: '',
            profilePic: userData.profilePic,
            balance: userData.balance
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

  //Para Ingresar Cambios
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  //Cambio de Imagen de Perfil 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // En una implementación real, aquí subirías la imagen al servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({
          ...formData,
          profilePic: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };


  //Si se realizan Cambios se 
  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      // Validaciones
      if (!formData.username || !formData.fullName) {
        setError('Nombre de usuario y nombre completo son obligatorios.');
        return;
      }

      if (!formData.currentPassword) {
        setError('Debe ingresar su contraseña actual para confirmar los cambios.');
        return;
      }

      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3000/api/user/edit-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Aquí se añade el SessionID al header de la petición.
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          username: formData.username,
          fullName: formData.fullName,
          // Asegúrate de que formData.profilePic contenga la URL de la imagen
          profilePic: formData.profilePic,
          currentPassword: formData.currentPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        setEditMode(false);
        setSuccess('Perfil actualizado correctamente.');
        setTimeout(() => setSuccess(''), 3000);

        // Actualizar datos locales
        setFormData({
          ...formData,
          password: '',
          currentPassword: ''
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


  // Aumentar Saldo del Usuario
  // En tu frontend:
  const handleAddBalance = async () => {

    // 1. Pide al usuario que ingrese el monto a agregar.

    const amount = parseFloat(prompt('¿Cuánto saldo deseas agregar?'));

    // 2. Valida que el monto sea un número positivo.

    if (isNaN(amount) || amount <= 0) {
      setError('Monto inválido. Debe ser un número positivo.');
      return;
    }

    // 3. Pide al usuario su contraseña para confirmar la transacción.
    const password = prompt('Para confirmar, ingresa tu contraseña:');

    // 4. Valida que la contraseña no esté vacía.
    if (!password) {
      setError('Operación cancelada. Debes ingresar la contraseña.');
      return;
    }
    // 5. Obtiene el token de sesión del almacenamiento local.
    const sessionId = localStorage.getItem('sessionId');
    // 6. Verifica si el token existe, indicando que el usuario está autenticado.

    if (!sessionId) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      return;
    }

    try {

      // 7. Envía la solicitud al backend usando `fetch`.

      const response = await fetch('http://localhost:3000/api/user/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        // 8. Envía el token de sesión en el encabezado 'Authorization'.
        body: JSON.stringify({ amount, password })
      });

      // 10. Verifica si la respuesta del servidor fue exitosa (código 200).

      if (response.ok) {
        // 11. Procesa la respuesta exitosa. Actualiza el saldo y muestra un mensaje de éxito.

        const result = await response.json();
        setFormData({
          ...formData,
          balance: result.newBalance
        });
        setSuccess(`Se agregaron $${amount} a tu saldo.`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // 12. Procesa la respuesta de error. Muestra un mensaje de error del servidor.
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al agregar saldo');
      }
    } catch (error) {

      // 13. Captura y maneja errores de red (por ejemplo, si el servidor está caído).
      console.error('Error de red:', error);
      setError('Error de conexión al agregar saldo');
    }
  };

  //Para Cerrar Sesion del Usuario
  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
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
                className={styles.editBtn} j
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