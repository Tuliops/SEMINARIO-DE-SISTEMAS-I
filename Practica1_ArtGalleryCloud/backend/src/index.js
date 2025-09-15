// index.js

const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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