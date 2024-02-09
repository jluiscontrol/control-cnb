
import pool from '../database.js';

// Función para agregar un nueva entidad
async function addUser(User) {
  const client = await pool.connect();
  try {
    const { nombre_usuario,estado, tipo_cuenta, contrasenia } = User;
    const result = await client.query('INSERT INTO usuario(entidad) VALUES( $1, $2, $3 ) RETURNING *', [nombre_usuario, estado, tipo_cuenta, contrasenia]);
    return result.rows[0];
  } finally { 
    client.release();
  }
}

// Exportar las funciones del modelo
export default { addUser };
