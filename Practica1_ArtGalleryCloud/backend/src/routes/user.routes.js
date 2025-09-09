
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');




// Ruta para mostrar perfil 
router.post('/profile', authController.getProfile);


// Ruta para editar el perfil del usuario (PUT)
router.put('/edit-profile', authController.editProfile);

router.get('/testUser', authController.testUser)

// Ruta para aumentar Saldo de la Cuenta  
router.post('/add-balance', authController.addBalance);
module.exports = router;