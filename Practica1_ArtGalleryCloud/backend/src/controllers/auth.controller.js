// backend/src/controllers/auth.controller.js

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ mensaje: 'Nombre de usuario y contraseña son requeridos.' });
    }

    if (username === 'testuser' && password === 'testpassword') {
        return res.status(200).json({ mensaje: 'Inicio de sesión exitoso.' });
    } else {
        return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }
};



//Logica para el reguistro de nuevos usuarios 
exports.register = (req, res) => {

    console.log('REGISTOR <-------')
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

    // (En un proyecto real, aquí iría el código para guardar el usuario en la BD y manejar la foto de perfil)
    return res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
}