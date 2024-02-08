/*const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'tu_usuario',
    host: 'localhost',
    database: 'tu_base_de_datos',
    password: 'tu_contraseña',
    port: 5432,
});

async function checkDatabaseConnection() {
    try {
        // Intenta conectar con la base de datos
        const client = await pool.connect();
        console.log('Conexión a la base de datos exitosa');
        client.release(); // Libera el cliente de la conexión
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

// Llama a la función para comprobar la conexión a la base de datos
checkDatabaseConnection();*/