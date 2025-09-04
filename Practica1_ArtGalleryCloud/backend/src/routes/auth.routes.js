// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');



// Ruta para el login de usuarios (POST)
router.post('/login', authController.login);

//Ruta para el registro de nuevos usuarios (POST)
router.post('/register', authController.register);

module.exports = router;