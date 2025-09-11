



// Simulación de base de datos en memoria
const database = {
  users: [
    {
      id: 1,
      username: "testuser",
      fullName: "Usuario de Prueba",
      password: "testpassword", // En producción, esto debería estar encriptado
      profilePic: "http://localhost:3000/images/basic_porfile.png",
      balance: 500.00,
      acquiredArt: []
    }
  ],
  sessions: {}, // Almacenará los tokens de sesión
  artworks: [
    {
      id: 1,
      isAvailable: true,
      title: "Noche estrellada",
      artist: "Vincent van Gogh",
      image: "https://tse1.mm.bing.net/th/id/OIP.m9JXrZObIzEXpuwUKx4rqQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Una de las obras más famosas de Van Gogh, pintada en 1889.",
      price: 100

    },
    {
      id: 2,
      isAvailable: true,
      title: "Dark Side Moon",
      artist: "Pink Floid",
      image: "https://tse4.mm.bing.net/th/id/OIP.CdQig4btMwmR0Kq5zSMhaQHaFB?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: " is the eighth studio LP by Pink Floyd. It was recorded at Abbey Road Studios in London, England, and released in 1973",
      price: 200
    },
    {
      id: 4,
      isAvailable: true,
      title: "El grito",
      artist: "Edvard Munch",
      image: "https://angeladearte.wordpress.com/wp-content/uploads/2016/08/120503_exp_scream-ex-crop-rectangle3-large.jpg",
      description: "Una obra expresionista que simboliza la ansiedad humana.",
      price: 400
    },
    {
      id: 5,
      isAvailable: true,
      title: "La creación de Adán",
      artist: "	Miguel Ángel",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1200px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
      description: "La creación de Adán es un fresco en la bóveda de la Capilla Sixtina, pintado por Miguel Ángel alrededor del año 1511",
      price: 1500
    }
  ]
};

// Función auxiliar para generar IDs únicos
let nextId = 6;
const generateId = () => nextId++;

// Función auxiliar para encontrar usuario por username
const findUserByUsername = (username) => {
  return database.users.find(user => user.username === username);
};

// Función auxiliar para encontrar usuario por ID
const findUserById = (id) => {
  return database.users.find(user => user.id === id);
};

// Función auxiliar para encontrar obra de arte por ID
const findArtworkById = (id) => {
  return database.artworks.find(art => art.id === id);
};


exports.testUser = (req, res) => {
  return res.status(201).json({
    mensaje: 'TEST UP.'
  });
}

// Logica para el Login de los Usuarios
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ mensaje: 'Nombre de usuario y contraseña son requeridos.' });
  }

  const user = findUserByUsername(username);

  if (user && user.password === password) {
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    database.sessions[sessionId] = {
      userId: user.id,
      createdAt: new Date()
    };

    console.log("Inicio de sesión exitoso para:", username);
    console.log("Estado actual de las sesiones:", database.sessions);

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      sessionId: sessionId,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        balance: user.balance
      }
    });
  } else {
    return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
  }
};

// Logica para el registro de nuevos usuarios
exports.register = (req, res) => {
  const { username, fullName, password, confirmPassword } = req.body;

  // Validar que todos los campos obligatorios esten presentes
  if (!username || !fullName || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Validar que la contraseña y la confirmación de la contraseña coincidan
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'La contraseña y la confirmación no coinciden.' });
  }

  // Verificar que nombre de usuario no exista
  if (findUserByUsername(username)) {
    return res.status(409).json({ mensaje: 'El nombre de usuario ya existe. Por favor, elige otro.' });
  }

  // Crear nuevo usuario
  const newUser = {
    id: generateId(),
    username: username,
    fullName: fullName,
    password: password,
    profilePic: "https://via.placeholder.com/150",
    balance: 100.00, // Saldo inicial
    acquiredArt: []
  };

  database.users.push(newUser);

  console.log("Usuario registrado exitosamente:", username);
  return res.status(201).json({
    mensaje: 'Usuario registrado exitosamente.',
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName
    }
  });
};

// Controlador para obtener la galería completa
exports.getGallery = (req, res) => {
  res.status(200).json(database.artworks);
};

// Controlador para realizar una compra (acquire)
exports.acquire = (req, res) => {
  const { artworkId } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  console.log("Sesión recibida en encabezado:", sessionId);
  console.log("Estado de las sesiones en la base de datos:", database.sessions[sessionId]);

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }


  if (!artworkId) {
    return res.status(400).json({ mensaje: "El ID de la obra de arte es requerido." });
  }

  const userId = database.sessions[sessionId].userId;
  const user = findUserById(userId);
  const artwork = findArtworkById(parseInt(artworkId));

  if (!artwork) {
    return res.status(404).json({ mensaje: "Obra de arte no encontrada." });
  }

  if (!artwork.isAvailable) {
    return res.status(409).json({ mensaje: "La obra de arte no está disponible para la venta." });
  }

  if (user.balance < artwork.price) {
    return res.status(402).json({ mensaje: "Saldo insuficiente para realizar la compra." });
  }

  // Realizar la transacción
  user.balance -= artwork.price;
  artwork.isAvailable = false;
  user.acquiredArt.push(artwork.id);

  res.status(200).json({
    mensaje: "Transacción exitosa. La obra ha sido adquirida.",
    newBalance: user.balance,
    acquiredArt: user.acquiredArt
  });
};

// Logica para mostrar TODA LA INFORMACION del perfil del usuario
exports.getProfile = (req, res) => {
  console.log("Iniciando solicitud GET PERFIL...");
  const sessionId = req.body.sessionId

  console.log("Sesión recibida en encabezado:", sessionId);
  console.log("Estado de las sesiones en la base de datos:", database.sessions[sessionId]);

  // Verificamos si la sesión existe en nuestra "base de datos"
  if (!sessionId || !database.sessions[sessionId]) {
    console.log("Sesión no válida o no encontrada.");
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }

  const userId = database.sessions[sessionId].userId;
  const user = findUserById(userId);

  if (!user) {
    console.log("Usuario no encontrado para el ID de sesión:", userId);
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }
  console.log("Perfil obtenido para el usuario:", user.username);

  // Obtener información detallada de las obras adquiridas
  const purchasedArtDetails = user.acquiredArt.map(artId =>
    findArtworkById(artId)
  ).filter(art => art !== undefined);

  res.status(200).json({
    username: user.username,
    fullName: user.fullName,
    profilePic: user.profilePic,
    balance: user.balance,
    purchasedArt: purchasedArtDetails
  });
};

// Lógica para aumentar el saldo del usuario
exports.addBalance = (req, res) => {

  // 1. Desestructura el cuerpo de la solicitud para obtener el monto y la contraseña.

  const { amount, password } = req.body; // 👈 Ahora también se espera la contraseña
  // 2. Extrae el ID de la sesión del encabezado de autorización.

  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  // 3. Verifica si existe un ID de sesión válido.
  // Si no hay sesión, responde con un error de "No autorizado".
  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }
  // 4. Valida el monto. Debe ser un número positivo.

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ mensaje: "Monto inválido. Debe ser un número positivo." });
  }
  // 5. Valida que se haya enviado la contraseña.

  if (!password) { // 👈 Validación de que se envió la contraseña
    return res.status(400).json({ mensaje: "Debe ingresar su contraseña." });
  }
  // 6. Busca al usuario en la "base de datos" usando el ID de la sesión.

  const userId = database.sessions[sessionId].userId;
  const user = findUserById(userId);

  // 7. Verifica si el usuario existe. Si no, responde con un error de "no encontrado".

  if (!user) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  // 8. Compara la contraseña enviada con la contraseña del usuario.
  // Si no coinciden, responde con un error de "contraseña incorrecta".

  if (user.password !== password) {
    return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
  }

  // 9. Si todas las validaciones pasan, aumenta el saldo del usuario.
  user.balance += amount;
  // 10. Responde con un mensaje de éxito y el nuevo saldo.

  res.status(200).json({
    mensaje: `Saldo aumentado exitosamente.`,
    newBalance: user.balance
  });
};

// Logica para cerrar sesión de la cuenta del usuario
exports.logout = (req, res) => {
  const sessionId = req.body.sessionId || req.headers.authorization?.replace('Bearer ', '');

  if (sessionId && database.sessions[sessionId]) {
    delete database.sessions[sessionId];
    res.status(200).json({ mensaje: "Sesión cerrada exitosamente." });
  } else {
    res.status(400).json({ mensaje: "Sesión no válida." });
  }
};

// Controlador para editar el perfil del usuario
exports.editProfile = (req, res) => {
  const { username, fullName, profilePic, currentPassword, newPassword } = req.body
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }

  const userId = database.sessions[sessionId].userId;
  const user = findUserById(userId);

  if (!user) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  // 1. Validar que se envíe la contraseña actual
  if (!currentPassword) {
    return res.status(400).json({ mensaje: 'Debe ingresar su contraseña actual para confirmar los cambios.' });
  }

  // 2. Verificar la contraseña actual
  if (currentPassword !== user.password) {
    return res.status(401).json({ mensaje: 'Contraseña incorrecta. No se pueden actualizar los datos.' });
  }

  // 3. Verificar que el nuevo nombre de usuario no esté en uso (si se está cambiando)
  if (username && username !== user.username) {
    if (findUserByUsername(username)) {
      return res.status(409).json({ mensaje: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
    }
  }

  // 4. Actualizar la información del usuario
  if (username) user.username = username;
  if (fullName) user.fullName = fullName;
  if (profilePic) user.profilePic = profilePic;
  if (newPassword) user.password = newPassword;

  // 5. Enviar respuesta de éxito
  res.status(200).json({
    mensaje: 'Perfil actualizado exitosamente.',
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profilePic: user.profilePic,
      balance: user.balance
    }
  });
};

// Controlador para obtener las obras adquiridas por el usuario
exports.getPurchasedArt = (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }

  const userId = database.sessions[sessionId].userId;
  const user = findUserById(userId);

  if (!user) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  // Obtener información detallada de las obras adquiridas
  const purchasedArtDetails = user.acquiredArt.map(artId =>
    findArtworkById(artId)
  ).filter(art => art !== undefined);

  res.status(200).json(purchasedArtDetails);
};

// Función para obtener datos de la base de datos (solo para desarrollo/depuración)
exports.getDatabase = (req, res) => {
  // No incluir contraseñas en la respuesta
  const usersWithoutPasswords = database.users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.status(200).json({
    users: usersWithoutPasswords,
    sessions: database.sessions,
    artworks: database.artworks
  });
};
