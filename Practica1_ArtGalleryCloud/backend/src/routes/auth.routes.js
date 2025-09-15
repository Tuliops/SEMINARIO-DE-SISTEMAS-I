// backend/src/routes/auth.routes.js

const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION
});

// 1. Carga las variables de entorno desde el archivo .env
// Esto se hace aquí porque es donde se utilizan las credenciales de AWS.
dotenv.config();

// 2. Configuración de AWS con variables de entorno
// Este paso es crucial para que la subida a S3 funcione.
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION
});


// 3. Configura Multer para manejar la subida de archivos en la memoria
const upload = multer({ storage: multer.memoryStorage() });

// 4. Ruta para el login de usuarios
router.post('/login', authController.login);

// 5. Ruta para el registro de nuevos usuarios
// Se usa 'upload.single('profilePic')' como middleware
// para procesar el archivo antes de llamar al controlador.
router.post('/register', upload.single('profilePic'), authController.register);

module.exports = router;