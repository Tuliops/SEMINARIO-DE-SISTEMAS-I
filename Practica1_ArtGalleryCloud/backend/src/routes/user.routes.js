// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de AWS con variables de entorno
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Crea una instancia de S3
const s3 = new AWS.S3();

// Configura Multer para manejar la subida de archivos en la memoria
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para el login de usuarios
router.post('/login', authController.login);

// Ruta para el registro de nuevos usuarios con el middleware de Multer
router.post('/register', upload.single('profilePic'), authController.register);

//INFORMACION DEL PERFIL DEL USUARIO
router.get('/profile', authController.getProfile)

//OBRAS ADQUIRIDAS POR EL USUARIO 

router.get('/purchasedArt', authController.getPurchasedArt)
// Ruta para editar el perfil del usuario (PUT)
router.put('/edit-profile', upload.single('profilePic'), authController.editProfile);


// Ruta para cerrar sesion del usuario  
router.post('/logout', authController.logout);

// Ruta para aumentar Saldo de la Cuenta  
router.post('/add-balance', authController.addBalance);


module.exports = router;