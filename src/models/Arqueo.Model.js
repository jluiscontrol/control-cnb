import pool from '../database.js';

//funcion para agregar un nuevo arqueo
async function addEncabezadoarqueo(encabezadoarqueo) {
  const arqueo = await pool.connect();
  try {
    const { caja_id, usuario_id, comentario, estado = true } = encabezadoarqueo;
    if (!caja_id || !usuario_id || !comentario) {
      throw new Error('Todos los campos son requeridos');
    }
    const result = await arqueo.query('INSERT INTO encabezadoarqueo(caja_id, usuario_id, estado, comentario) VALUES($1, $2, $3, $4) RETURNING *', [caja_id, usuario_id, estado, comentario]);
    return result.rows[0];
  } finally {
    arqueo.release();
  }
}

//funcion para obtener todos los arqueos
async function getAllArqueo() {
  const arqueo = await pool.connect();
  try {
    const result = await arqueo.query('SELECT * FROM encabezadoarqueo ORDER BY id_encabezadoarqueo');
    return result.rows;
  } finally {
    arqueo.release();
  }
}

// Función para obtener un arqueo por su ID
export const getArqueoById = async (encabezadoarqueoId ) => {
    try {
      const client = await pool.connect();
      const query = 'SELECT * FROM encabezadoarqueo WHERE id_encabezadoarqueo = $1';
      const result = await client.query(query, [encabezadoarqueoId]);
      client.release();
      if (result.rows.length === 0) {
        return { error: 'Arqueo no encontrado' }; // Devuelve un objeto con el mensaje de error
      }
      return result.rows[0]; // Devuelve la entidad bancaria encontrada
    } catch (error) {
      console.error('Error al obtener el arqueo por ID:', error);
      throw error; // Relanza el error para que sea manejado por el controlador
    }
  }

// Función para actualizar la entidad bancaria por su ID
export const updateArqueoById = async (encabezadoarqueoId, newData) => {
    try {
      const client = await pool.connect();
      const query = 'UPDATE encabezadoarqueo SET caja_id = $1, usuario_id = $2, comentario = $3 WHERE id_encabezadoarqueo = $4';
      const result = await client.query(query, [newData.caja_id, newData.usuario_id,  newData.comentario, encabezadoarqueoId]);
  
      if (result.rowCount === 0) {
        return { error: 'El arqueo con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
      }
  
      client.release();
      return { message: 'Arqueo actualizado correctamente' };
    } catch (error) {
      throw new Error('Error al actualizar el arqueo: ' + error.message);
    }
  };

export default { addEncabezadoarqueo, getAllArqueo, getArqueoById, updateArqueoById };
