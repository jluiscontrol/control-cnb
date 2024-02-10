
import pool from '../database.js';

// Función para agregar un nuevo usuario
async function addUser(User) {
  const client = await pool.connect();
  try {
    const { nombre_usuario,estado, tipo_cuenta, contrasenia } = User;
    const result = await client.query('INSERT INTO usuario(nombre_usuario, estado, tipo_cuenta, contrasenia) VALUES( $1, $2, $3, $4 ) RETURNING *', [nombre_usuario, estado, tipo_cuenta, contrasenia]);
    return result.rows[0];
  } finally { 
    client.release();
  }
}

// Exportar las funciones del modelo
export default { addUser };
