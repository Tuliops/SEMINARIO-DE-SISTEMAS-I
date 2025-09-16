// index.js

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


// Configura body-parser para aceptar cargas útiles más grandes
// Aumenta el límite del JSON a 50mb (ajusta el tamaño según tu necesidad)
app.use(express.json({ limit: '50mb' }));

// Aumenta el límite de las URL-encoded a 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth.routes');
const galleryRoutes = require('./routes/gallery.routes');
const usersRoutes = require('./routes/user.routes');

app.use(cors());
app.use(express.json());

// Conecta las rutas de autenticación
app.use('/api/auth', authRoutes);

// Conecta las demás rutas
app.use('/api/user', usersRoutes);
app.use('/api', galleryRoutes);

app.get('/', (req, res) => {
    res.send('¡Servidor de backend funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});