import pool from '../database.js';

async function addEncabezadoarqueo(encabezadoarqueo, detalles) {
  const arqueo = await pool.connect();
  try {
    const { caja_id, usuario_id, comentario } = encabezadoarqueo;

    if (!caja_id || !usuario_id || !comentario || !detalles || detalles.length === 0) {
      throw new Error('Todos los campos son requeridos');
    }

    // Insertar el encabezado del arqueo
    const arqueoInsertResult = await arqueo.query('INSERT INTO encabezadoarqueo(caja_id, usuario_id, comentario) VALUES($1, $2, $3) RETURNING id_encabezadoarqueo', [caja_id, usuario_id, comentario]);
    const encabezadoarqueoId = arqueoInsertResult.rows[0].id_encabezadoarqueo;

    // Insertar cada detalle del arqueo
    for (const detalle of detalles) {
      const { tipodinero, valor, cantidad } = detalle;
      await arqueo.query('INSERT INTO detallearqueo(tipodinero, valor, cantidad, encabezadoarqueo_id) VALUES($1, $2, $3, $4)', [tipodinero, valor, cantidad, encabezadoarqueoId]);
    }

    return encabezadoarqueoId; // Devuelve el ID del encabezado del arqueo insertado
  } finally {
    arqueo.release();
  }
}

async function getAllArqueo() {
  const arqueo = await pool.connect();
  try {
    const result = await arqueo.query(
      `SELECT 
        e.id_encabezadoarqueo,
        e.caja_id,
        e.usuario_id,
        e.estado,
        e.comentario,
        d.tipodinero AS tipoDinero,
        d.valor,
        d.cantidad
      FROM encabezadoarqueo e 
      LEFT JOIN detallearqueo d ON e.id_encabezadoarqueo = d.encabezadoarqueo_id
      ORDER BY e.id_encabezadoarqueo`
    );
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

// Función para actualizar el arqueo por su ID
export const updateArqueoById = async (encabezadoarqueoId, newData) => {
  try {
    const client = await pool.connect();
    const query = 'UPDATE encabezadoarqueo SET caja_id = $1, usuario_id = $2, comentario = $3 WHERE id_encabezadoarqueo = $4';
    const result = await client.query(query, [newData.caja_id, newData.usuario_id,  newData.comentario, encabezadoarqueoId]);

    if (result.rowCount === 0) {
      return { error: 'El arqueo con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }
    
    // Actualizar los datos en la tabla detallearqueo si se proporcionaron
    if (newData.tipodinero !== undefined || newData.valor !== undefined || newData.cantidad !== undefined) {
      const detallearqueoQuery = 'UPDATE detallearqueo SET tipodinero = $1, valor = $2, cantidad = $3 WHERE encabezadoarqueo_id = $4';
      await client.query(detallearqueoQuery, [newData.tipodinero, newData.valor, newData.cantidad, encabezadoarqueoId]);
    }

    client.release();
    return { message: 'Arqueo actualizado correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar el arqueo: ' + error.message);
  }
};

export default { addEncabezadoarqueo, getAllArqueo, getArqueoById, updateArqueoById };
