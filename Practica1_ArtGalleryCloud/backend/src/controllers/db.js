// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  port: process.env.RDS_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Agrega este bloque para probar la conexión
console.log(pool.user);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("🎉 Conexión a la base de datos MySQL en RDS exitosa.");
    connection.release();
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1); // Cierra el proceso si la conexión falla
  }
}

testConnection();

module.exports = pool;