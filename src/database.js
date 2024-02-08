import express from 'express'
import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la conexión a PostgreSQL
//work
const pool = new Pool({
    user: 'postgres',
    host: '192.168.100.22',
    database: 'control-cnb',
    password: 'Control2701',
    port: 5432,
}); 

//home
/*const pool = new Pool({
    user: 'tu_usuario',
    host: 'localhost',
    database: 'tu_base_de_datos',
    password: 'tu_contraseña',
    port: 5432,
});**/

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
checkDatabaseConnection();