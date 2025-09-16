// artControllers.js
const AWS = require('aws-sdk');
const crypto = require('crypto');
const md5 = require('md5'); // Se usa para encriptar la contraseña

// Importa el pool de conexiones desde tu archivo db.js
const pool = require('./db');

// El objeto 'database' solo se mantiene para la simulación de sesiones
const database = {
  sessions: {},
};

// Asumiendo que AWS S3 ya está configurado
const s3 = new AWS.S3();

exports.testUser = (req, res) => {
  return res.status(201).json({ mensaje: 'TEST UP.' });
};

// Lógica para el Login de los Usuarios
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ mensaje: 'Nombre de usuario y contraseña son requeridos.' });
  }



  //const [allUsers] = await pool.execute("SELECT * FROM Usuarios");
  //console.log("Todos los usuarios en la base de datos:", allUsers);

  try {
    // Imprime los valores que se van a usar en la consulta
    console.log("Buscando usuario:", username);
    console.log("Contraseña encriptada:", md5(password));

    const [rows] = await pool.execute(
      `SELECT id_usuario, username, nombre_completo, foto_perfil_url, saldo
   FROM Usuarios WHERE username = ? AND contrasena = ?`,
      [username, md5(password)]
    );


    console.log(rows);

    const user = rows[0];
    if (user) {
      const sessionId = crypto.randomBytes(16).toString('hex');
      database.sessions[sessionId] = { userId: user.id_usuario, createdAt: new Date() };

      return res.status(200).json({
        mensaje: 'Inicio de sesión exitoso.',
        sessionId,
        user: {
          id: user.id_usuario,
          username: user.username,
          fullName: user.nombre_completo,
          profilePic: user.foto_perfil_url,
          balance: user.saldo,
        },
      });
    } else {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Lógica para el registro de usuarios
exports.register = async (req, res) => {
  const { username, fullName, password, confirmPassword } = req.body;
  const profilePicFile = req.file;

  if (!username || !fullName || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Todos los campos de texto son obligatorios.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'La contraseña y la confirmación no coinciden.' });
  }

  try {
    const [existingUsers] = await pool.execute('SELECT username FROM Usuarios WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ mensaje: 'El nombre de usuario ya existe. Por favor, elige otro.' });
    }

    let profilePicUrl = "https://via.placeholder.com/150";
    if (profilePicFile) {
      const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${profilePicFile.originalname}`;
      const s3UploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Fotos_Perfil/${uniqueFileName}`,
        Body: profilePicFile.buffer,
        ContentType: profilePicFile.mimetype,
      };
      const s3Result = await s3.upload(s3UploadParams).promise();
      profilePicUrl = s3Result.Location;
    }

    const [result] = await pool.execute(
      `INSERT INTO Usuarios (username, nombre_completo, contrasena, foto_perfil_url, saldo)
       VALUES (?, ?, ?, ?, ?)`,
      [username, fullName, md5(password), profilePicUrl, 100.00]
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      user: {
        id: result.insertId,
        username,
        fullName,
        profilePic: profilePicUrl,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ mensaje: 'Error al registrar el usuario.' });
  }
};

// Controlador para obtener la galería completa
exports.getGallery = async (req, res) => {
  try {
    const [artworks] = await pool.execute(`
      SELECT 
        id_obra AS id, 
        titulo AS title, 
        autor AS artist, 
        anio_publicacion AS year,
        precio AS price, 
        disponibilidad AS isAvailable,
        url_imagen AS image
      FROM Obras
    `);
    res.status(200).json(artworks);
  } catch (error) {
    console.error("Error al obtener la galería:", error);
    res.status(500).json({ mensaje: 'Error al obtener la galería.' });
  }
};

// Controlador para realizar una compra (acquire)
exports.acquire = async (req, res) => {
  const { artworkId } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }
  if (!artworkId) {
    return res.status(400).json({ mensaje: "El ID de la obra de arte es requerido." });
  }

  const userId = database.sessions[sessionId].userId;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[user]] = await connection.execute('SELECT saldo FROM Usuarios WHERE id_usuario = ? FOR UPDATE', [userId]);
    const [[artwork]] = await connection.execute('SELECT precio, disponibilidad FROM Obras WHERE id_obra = ? FOR UPDATE', [artworkId]);

    if (!artwork) {
      await connection.rollback();
      return res.status(404).json({ mensaje: "Obra de arte no encontrada." });
    }
    if (artwork.disponibilidad !== 1) {
      await connection.rollback();
      return res.status(409).json({ mensaje: "La obra de arte no está disponible para la venta." });
    }
    if (user.saldo < artwork.precio) {
      await connection.rollback();
      return res.status(402).json({ mensaje: "Saldo insuficiente para realizar la compra." });
    }

    await connection.execute('UPDATE Usuarios SET saldo = saldo - ? WHERE id_usuario = ?', [artwork.precio, userId]);
    await connection.execute('UPDATE Obras SET disponibilidad = 0 WHERE id_obra = ?', [artworkId]);
    await connection.execute('INSERT INTO Transacciones (id_usuario, id_obra, monto) VALUES (?, ?, ?)', [userId, artworkId, artwork.precio]);

    await connection.commit();

    const newBalance = user.saldo - artwork.precio;
    const [acquiredArt] = await pool.execute('SELECT id_obra FROM Transacciones WHERE id_usuario = ?', [userId]);

    res.status(200).json({
      mensaje: "Transacción exitosa. La obra ha sido adquirida.",
      newBalance,
      acquiredArt: acquiredArt.map((row) => row.id_obra),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la compra:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  } finally {
    connection.release();
  }
};

// Lógica para mostrar toda la información del perfil del usuario
exports.getProfile = async (req, res) => {


  const sessionId = req.headers['x-session-id'] || req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }


  const userId = database.sessions[sessionId].userId;

  try {
    const [[user]] = await pool.execute(`
      SELECT username, nombre_completo, foto_perfil_url, saldo
      FROM Usuarios WHERE id_usuario = ?`, [userId]);

    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }


    const [purchasedArt] = await pool.execute(`
       SELECT o.id_obra AS id, o.titulo, o.autor AS artist, o.anio_publicacion AS year,
       o.precio AS price, o.disponibilidad AS isAvailable, o.url_imagen AS image
       FROM Transacciones t JOIN Obras o ON t.id_obra = o.id_obra
       WHERE t.id_usuario = ?`, [userId]);

    res.status(200).json({
      username: user.username,
      fullName: user.nombre_completo,
      profilePic: user.foto_perfil_url,
      balance: user.saldo,
      purchasedArt,
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ mensaje: 'Error al obtener el perfil.' });
  }
};

// Lógica para aumentar el saldo del usuario
exports.addBalance = async (req, res) => {
  const { amount, password } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ mensaje: "Monto inválido. Debe ser un número positivo." });
  }
  if (!password) {
    return res.status(400).json({ mensaje: "Debe ingresar su contraseña." });
  }

  const userId = database.sessions[sessionId].userId;

  try {
    const [[user]] = await pool.execute(`
      SELECT contrasena, saldo FROM Usuarios WHERE id_usuario = ?`, [userId]);

    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    if (user.contrasena !== md5(password)) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
    }

    await pool.execute('UPDATE Usuarios SET saldo = saldo + ? WHERE id_usuario = ?', [amount, userId]);
    const newBalance = user.saldo + amount;

    res.status(200).json({
      mensaje: `Saldo aumentado exitosamente.`,
      newBalance,
    });
  } catch (error) {
    console.error("Error al aumentar el saldo:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Lógica para cerrar sesión de la cuenta del usuario
exports.logout = (req, res) => {
  const sessionId = req.body.sessionId || req.headers.authorization?.replace('Bearer ', '');

  if (sessionId && database.sessions[sessionId]) {
    delete database.sessions[sessionId];
    res.status(200).json({ mensaje: "Sesión cerrada exitosamente." });
  } else {
    res.status(400).json({ mensaje: "Sesión no válida." });
  }
};

// Controlador para editar el perfil del usuario (con subida a S3)
exports.editProfile = async (req, res) => {
  const { username, fullName, currentPassword, newPassword } = req.body;
  const profilePicFile = req.file; // Obtiene el archivo de la solicitud
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  console.log(profilePicFile)
  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }

  const userId = database.sessions[sessionId].userId;

  try {
    const [[user]] = await pool.execute(`
      SELECT username, contrasena FROM Usuarios WHERE id_usuario = ?`, [userId]);

    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    if (!currentPassword) {
      return res.status(400).json({ mensaje: 'Debe ingresar su contraseña actual para confirmar los cambios.' });
    }
    if (md5(currentPassword) !== user.contrasena) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta. No se pueden actualizar los datos.' });
    }
    if (username && username !== user.username) {
      const [existingUsers] = await pool.execute('SELECT username FROM Usuarios WHERE username = ?', [username]);
      if (existingUsers.length > 0) {
        return res.status(409).json({ mensaje: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
      }
    }

    // Lógica para subir la nueva imagen de perfil si se proporciona
    let newProfilePicUrl;
    if (profilePicFile) {
      const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}-${profilePicFile.originalname}`;
      const s3UploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Fotos_Perfil/${uniqueFileName}`,
        Body: profilePicFile.buffer,
        ContentType: profilePicFile.mimetype,
      };

      const s3Result = await s3.upload(s3UploadParams).promise();
      newProfilePicUrl = s3Result.Location;
    }
    console.log("cambio de imagen de perfil" + newProfilePicUrl);
    

    
    
    // Construir la consulta de actualización dinámicamente
    let updateQuery = 'UPDATE Usuarios SET';
    const params = [];
    if (username) {
      updateQuery += ' username = ?,';
      params.push(username);
    }
    if (fullName) {
      updateQuery += ' nombre_completo = ?,';
      params.push(fullName);
    }
    // Añadir la nueva URL si se subió un archivo
    if (newProfilePicUrl) {
      updateQuery += ' foto_perfil_url = ?,';
      params.push(newProfilePicUrl);
    }
    if (newPassword) {
      updateQuery += ' contrasena = ?,';
      params.push(md5(newPassword));
    }

    if (params.length === 0) {
      return res.status(200).json({ mensaje: 'No se realizaron cambios.' });
    }

    updateQuery = updateQuery.slice(0, -1) + ' WHERE id_usuario = ?';
    params.push(userId);

    await pool.execute(updateQuery, params);

    const [[updatedUser]] = await pool.execute(`
      SELECT id_usuario, username, nombre_completo, foto_perfil_url, saldo
      FROM Usuarios WHERE id_usuario = ?`, [userId]);

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente.',
      user: {
        id: updatedUser.id_usuario,
        username: updatedUser.username,
        fullName: updatedUser.nombre_completo,
        profilePic: updatedUser.foto_perfil_url,
        balance: updatedUser.saldo,
      },
    });
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Controlador para obtener las obras adquiridas por el usuario
exports.getPurchasedArt = async (req, res) => {
  console.log("obras adquiridas");

  const sessionId = req.headers['x-session-id'] || req.headers.authorization?.replace('Bearer ', '');

  if (!sessionId || !database.sessions[sessionId]) {
    return res.status(401).json({ mensaje: 'No autorizado. Por favor, inicie sesión.' });
  }

  const userId = database.sessions[sessionId].userId;

  try {
    const [purchasedArtDetails] = await pool.execute(`
      SELECT 
        o.id_obra AS id, 
        o.titulo, 
        o.autor AS artist, 
        o.anio_publicacion AS year,
        o.precio AS price, 
        o.disponibilidad AS isAvailable, 
        o.url_imagen AS image
      FROM Transacciones t 
      JOIN Obras o ON t.id_obra = o.id_obra
      WHERE t.id_usuario = ?`, [userId]);

    if (!purchasedArtDetails) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.status(200).json(purchasedArtDetails);
  } catch (error) {
    console.error("Error al obtener las obras adquiridas:", error);
    res.status(500).json({ mensaje: 'Error al obtener las obras adquiridas.' });
  }
};