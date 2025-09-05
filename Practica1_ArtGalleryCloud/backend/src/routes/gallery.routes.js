/*El código en el archivo gallery.routes.js define una única ruta para obtener la galería de imágenes.
 En términos simples, actúa como el traductor entre el cliente  y la lógica de tu aplicación. */

 const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para obtener todas las obras de arte (GET)
router.get('/gallery', authController.getGallery);

// Ruta para realizar una compra (acquire)
router.post('/acquire', authController.acquire);


// Ruta para mostrar perfil 
router.get('/profile', authController.getProfile);

// Ruta para aumentar Saldo de la Cuenta  
router.post('/add-balance', authController.addBalance);

// Ruta para cerrar sesion del usuario  
router.post('/logout', authController.logout);


// Ruta para editar el perfil del usuario (PATCH)
router.patch('/profile', authController.editProfile);


module.exports = router;