// Importa el módulo 'express', que es el framework de Node.js para crear el servidor.
const express = require('express');

// Crea una instancia de la aplicación Express.
const app = express();

// Importa el módulo 'cors', que es el middleware para permitir peticiones desde el frontend.
const cors = require('cors');

// Usa el middleware CORS aquí para permitir peticiones desde el frontend.
// ¡Este debe ir antes de definir tus rutas para que funcione!
app.use(cors());

// Define el puerto en el que el servidor va a escuchar las peticiones.
// Usa la variable de entorno PORT si existe, de lo contrario, usa el puerto 3000.
const PORT = process.env.PORT || 3000;

// Importa el archivo de rutas de autenticación que creaste.
// La ruta es relativa a la ubicación de este archivo.
const authRoutes = require('./routes/auth.routes');

// Importa el módulo de rutas de la galería.
const galleryRoutes = require('./routes/gallery.routes');

// Middleware para procesar el cuerpo de la solicitud JSON.
// Esto permite que el servidor entienda y analice los datos JSON
// que se envían en el cuerpo de las peticiones POST.
app.use(express.json());

// Conecta las rutas de autenticación con la aplicación principal.
// Todas las rutas en 'authRoutes' estarán disponibles bajo el prefijo '/api/auth'.
app.use('/api/auth', authRoutes);

// Conecta las rutas de la galería con la aplicación principal.
// Estas rutas estarán disponibles bajo el prefijo '/api'.
app.use('/api', galleryRoutes);

// Define una ruta de prueba para verificar que el servidor está funcionando.
// Esta ruta responde a peticiones GET a la URL raíz '/'.
app.get('/', (req, res) => {
    res.send('¡Servidor de backend funcionando!');
});

// Inicia el servidor y lo pone a la escucha de peticiones en el puerto definido.
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});