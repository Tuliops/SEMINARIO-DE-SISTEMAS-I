// backend/src/controllers/auth.controller.js
const sessions = {}; // Almacenará los tokens de sesión





//Logica para el Login de los Usuarios 
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        const sessionId = Math.random().toString(36).substring(2, 15); // Crea un ID de sesión simple
        sessions[sessionId] = user; // Guarda el usuario en la sesión

        return res.status(400).json({ mensaje: 'Nombre de usuario y contraseña son requeridos.' });
    }

    if (username === 'testuser' && password === 'testpassword') {
        console.log("Incio de sesión exitoso.")
        return res.status(200).json({ mensaje: 'Inicio de sesión exitoso.' });
    } else {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }
};


//Logica para el reguistro de nuevos usuarios 
exports.register = (req, res) => {

    // Definiendo variables que se llegaran en JSON para validacion 

    const { username, fullName, password, confirmPassword } = req.body;

    // Validar que todos los campos obligatorios esten presentes 

    if (!username || !fullName || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios. !' })
    }

    // validar que la contraseña y la confirmacion de la contraseña coincidan 


    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'La contraseña y la confirmación no coinciden.' })
    }

    // verificar que nombre de usuario no exista en la db 

    /// AGREGAR LOGICA PARA DB 

    if (username === 'testuser') {
        return res.status(409).json({ mensaje: 'El nombre de usuario ya existe. --> INTENTE CON UNA NUEVA  ' });
    }
    // Si todas las validaciones pasan, el usuario se puede crear.
    console.log("Usuario registrado exitosamente. : "  );
    // (En un proyecto real, aquí iría el código para guardar el usuario en la BD y manejar la foto de perfil)
    return res.status(201).json({ mensaje: 'Usuario registrado exitosamente.', });
}


///--------------------- TEST - DB SIMULATION ----------------------------
// Simulación de datos de la base de datos para el usuario y la galería

const user = {
    id: 1,
    username: "testuser",
    fullName: "Usuario de Prueba",
    profilePic: "url_a_la_foto",
    balance: 500.00,
    acquiredAart: []
};

const galleryData = [
    {
        id: 1,
        title: "El Grito",
        author: "Edvard Munch",
        year: 1893,
        price: 250.00,
        isAvailable: false
    },
    {
        id: 2,
        title: "La noche estrellada",
        author: "Vincent van Gogh",
        year: 1889,
        price: 300.00,
        isAvailable: true
    },
    {
        id: 3,
        title: "La última cena",
        author: "Leonardo da Vinci",
        year: 1498,
        price: 550.00,
        isAvailable: true
    }
];

//-------------------------------------------------------------------------------------------------

// Controlador para obtener la galería completa
exports.getGallery = (req, res) => {
    // En la  aplicación real, aquí harías una consulta a la base de datos
    // para obtener todas las obras de arte.cls

    res.status(200).json(galleryData);
};

// Controlador para realizar una compra (acquire)
exports.acquire = (req, res) => {
    const { artworkId } = req.body;
    if (!artworkId) {
        return res.status(400).json({ mensaje: "El ID de la obra de arte es requerido." });
    }

    const artwork = galleryData.find(art => art.id === artworkId);
    if (!artwork) {
        return res.status(404).json({ mensaje: "Obra de arte no encontrada." });
    }
    if (!artwork.isAvailable) {
        return res.status(409).json({ mensaje: "La obra de arte no está disponible para la venta." });
    }
    if (user.balance < artwork.price) {
        return res.status(402).json({ mensaje: "Saldo insuficiente para realizar la compra." });
    }

    // Cambia el Saldo de usuario al adquirir una obra de arte 
    user.balance -= artwork.price;
    // La obra de arte cambia de status de disponibre al ser adquirida 
    artwork.isAvailable = false;
    //S guarda en el registro del usuario la obra de arte adquirida (id del la obra de arte)
    user.acquiredAart.push(artwork)

    res.status(200).json({
        mensaje: "Transacción exitosa. La obra ha sido adquirida.",
        newBalance: user.balance
    });
};


// Logica para mostrar TODA LA INFORMACION del perfil del usuarios 
exports.getProfile = (req, res) => {
    const { sessionId } = req.body;
    const sessionUser = sessions[sessionId];

    if (!sessionUser) {
        return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
    }

    res.status(200).json({
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        balance: user.balance,
        purchasedArt: user.acquiredAart
    });
};




// Logica para para aumentar el saldo del usuario 
exports.addBalance = (req, res) => {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ mensaje: "Monto inválido. Debe ser un número positivo." });
    }

    user.balance += amount;
    res.status(200).json({
        mensaje: `Saldo aumentado exitosamente.`,
        newBalance: user.balance
    });
};

// Logica apra cerrar sesion de la cuanta del usuario
exports.logout = (req, res) => {
    const { sessionId } = req.body;
    delete sessions[sessionId]; // Elimina el ID de la sesión
    res.status(200).json({ mensaje: "Sesión cerrada exitosamente." });
};

// Controlador para editar el perfil del usuario
exports.editProfile = (req, res) => {
    const { username, fullName, profilePic, currentPassword } = req.body;

    // 1. Validar que se envíe la contraseña actual
    if (!currentPassword) {
        return res.status(400).json({ mensaje: 'Debe ingresar su contraseña actual para confirmar los cambios.' });
    }

    // 2. Simulación de la verificación de la contraseña
    // En una aplicación real, aquí compararías la contraseña ingresada
    // con la contraseña encriptada del usuario en la base de datos.
    if (currentPassword !== 'testpassword') {
        return res.status(401).json({ mensaje: 'Contraseña incorrecta. No se pueden actualizar los datos.' });
    }

    // 3. Actualizar la información del usuario
    if (username) {
        user.username = username;
    }
    if (fullName) {
        user.fullName = fullName;
    }
    // En una aplicación real, la lógica de la foto de perfil sería más compleja (subida a S3, etc.)
    if (profilePic) {
        user.profilePic = profilePic;
    }

    // 4. Enviar respuesta de éxito
    res.status(200).json({
        mensaje: 'Perfil actualizado exitosamente.',
        user: {
            username: user.username,
            fullName: user.fullName,
            profilePic: user.profilePic
        }
    });
};