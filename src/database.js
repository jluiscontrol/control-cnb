
import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la conexión a PostgreSQL
//work  
<<<<<<< HEAD

const pool = new Pool({
=======
/*const pool = new Pool({
>>>>>>> b5bbdd4bbc69927613a586ff82319522404e39e8
    user: 'postgres',
    host: '192.168.100.22',
    database: 'control-cnb',
    password: 'Control2701',
    port: 5432,
<<<<<<< HEAD
}); 


//home
//  const pool = new Pool({
//      user: 'postgres',
//      host: 'localhost',
//      database: 'cnb',
//      password: '',
//      port: 5432,
//  });
=======
}); */

//home
   const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'control-cnb',
    password: '123456',
    port: 5432,
});
>>>>>>> b5bbdd4bbc69927613a586ff82319522404e39e8



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
export default pool;