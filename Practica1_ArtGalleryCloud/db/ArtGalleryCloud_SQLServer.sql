-- ================================
-- Crear base de datos
-- ================================
CREATE DATABASE IF NOT EXISTS ArtGalleryCloud;
USE ArtGalleryCloud;

-- ================================
-- Crear tabla Usuarios
-- ================================
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    contrasena CHAR(32) NOT NULL, -- almacenada en MD5k
    foto_perfil_url VARCHAR(255), -- solo ruta en S3
    saldo DECIMAL(10,2) DEFAULT 0.00
);

-- ================================
-- Crear tabla Obras
-- ================================
CREATE TABLE Obras (
    id_obra INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    anio_publicacion INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    disponibilidad TINYINT(1) DEFAULT 1, -- 1 = disponible
    url_imagen VARCHAR(255) NOT NULL -- ruta en S3
);

-- ================================
-- Crear tabla Transacciones
-- ================================
CREATE TABLE Transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_obra INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_obra) REFERENCES Obras(id_obra) ON DELETE CASCADE
);

-- ================================
-- Insertar usuarios de prueba (con fotos en S3)
-- ================================
INSERT INTO Usuarios (username, nombre_completo, contrasena, foto_perfil_url, saldo)
VALUES
('juan123', 'Juan Pérez', MD5('password123'), 'Fotos_Perfil/juan123.jpg', 300.00),
('maria_art', 'María López', MD5('claveSegura'), 'Fotos_Perfil/maria_art.jpg', 500.00),
('carlos_gt', 'Carlos Ramírez', MD5('123456'), 'Fotos_Perfil/carlos_gt.jpg', 150.00);

-- ================================
-- Insertar obras de prueba (con imágenes en S3)
-- ================================
INSERT INTO Obras (titulo, autor, anio_publicacion, precio, disponibilidad, url_imagen)
VALUES
('Atardecer Maya', 'María López', 2024, 150.00, 1, 'Obras/atardecer.jpg'),
('Volcán de Fuego', 'Carlos Ramírez', 2023, 200.00, 1, 'Obras/volcan.jpg'),
('Rostro Ancestral', 'Juan Pérez', 2022, 120.00, 1, 'Obras/rostro.jpg');

-- ================================
-- Ejemplo de compra
-- ================================
-- Juan (id_usuario = 1) compra "Volcán de Fuego" (id_obra = 2)
INSERT INTO Transacciones (id_usuario, id_obra, monto)
VALUES (1, 2, 200.00);

-- Marcar la obra como no disponible
UPDATE Obras SET disponibilidad = 0 WHERE id_obra = 2;

-- Restar saldo a Juan
UPDATE Usuarios SET saldo = saldo - 200.00 WHERE id_usuario = 1;

-- ================================
-- Consultas de prueba
-- ================================
-- Ver todos los usuarios
SELECT * FROM Usuarios;

-- Ver todas las obras
SELECT * FROM Obras;

-- Ver todas las transacciones
SELECT * FROM Transacciones;

-- Ver obras adquiridas por Juan
SELECT o.titulo, o.autor, t.monto, t.fecha
FROM Obras o
JOIN Transacciones t ON o.id_obra = t.id_obra
WHERE t.id_usuario = 1;
