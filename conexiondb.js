/*const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware para analizar JSON
app.use(bodyParser.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: '192.168.100.22',
    database: 'control-cnb',
    password: 'Control2701',
    port: 5432,
});

// Endpoint de login
app.post('/login', async (req, res) => {
    const { nombre_usuario, contrasenia } = req.body;

    try {
        // Consulta para verificar las credenciales del usuario en la base de datos
        const resultado = await pool.query('SELECT * FROM usuario WHERE nombre_usuario = $1 AND contrasenia = $2', [nombre_usuario, contrasenia]);

        if (result.rows.length > 0) {
            // Si se encuentra un usuario con las credenciales proporcionadas, devuelve un mensaje de éxito
            res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            // Si no se encuentra un usuario con las credenciales proporcionadas, devuelve un mensaje de error
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        // Si ocurre algún error durante la consulta a la base de datos, devuelve un mensaje de error
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
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