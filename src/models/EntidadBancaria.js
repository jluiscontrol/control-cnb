
import pool from '../database.js';

// Función para agregar un nueva entidad
async function addEntidadBancaria(entidadBancaria) {
  const client = await pool.connect();
  try {
    const { entidad } = entidadBancaria;
    const result = await client.query('INSERT INTO entidadbancaria(entidad) VALUES( $1 ) RETURNING *', [entidad]);
    return result.rows[0];
  } finally { 
    client.release();
  }
}

// Exportar las funciones del modelo
export default { addEntidadBancaria };
