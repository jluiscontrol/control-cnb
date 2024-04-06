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

    // Actualizar los datos del encabezado del arqueo
    const query = 'UPDATE encabezadoarqueo SET caja_id = $1, usuario_id = $2, comentario = $3 WHERE id_encabezadoarqueo = $4';
    const result = await client.query(query, [newData.caja_id, newData.usuario_id, newData.comentario, encabezadoarqueoId]);

    if (result.rowCount === 0) {
      return { error: 'El arqueo con el ID proporcionado no existe' };
    }

    // Actualizar los detalles del arqueo si se proporcionaron
    if (newData.detalles && newData.detalles.length > 0) {
      for (const detalle of newData.detalles) {
        const { id_detallearqueo, tipodinero, valor, cantidad } = detalle;
        const updateDetalleQuery = 'UPDATE detallearqueo SET tipodinero = $1, valor = $2, cantidad = $3 WHERE id_detalle_arqueo = $4';
        await client.query(updateDetalleQuery, [tipodinero, valor, cantidad, id_detallearqueo]);
      }
    }

    client.release();
    return { message: 'Arqueo actualizado correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar el arqueo: ' + error.message);
  }
};

export const getFilterFecha = async (desde, hasta, nombreUsuario) => {
  const arqueo = await pool.connect();
  try {
    let query = `
      SELECT DISTINCT ON (e.id_encabezadoarqueo)
        e.id_encabezadoarqueo,
        e.caja_id,
        e.usuario_id,
        e.estado,
        e.comentario,
        e.fechacreacion,
        d.tipodinero AS tipoDinero,
        d.valor,
        d.cantidad,
        c.nombre AS nombre_caja,
        u.nombre_usuario
      FROM encabezadoarqueo e 
      LEFT JOIN detallearqueo d ON e.id_encabezadoarqueo = d.encabezadoarqueo_id
      LEFT JOIN caja c ON c.id_caja = e.caja_id
      LEFT JOIN usuario u ON u.id_usuario = e.usuario_id
      WHERE e.fechacreacion BETWEEN $1 AND (DATE_TRUNC('day', $2::timestamp with time zone) + INTERVAL '1 day' - INTERVAL '1 second')`;

    const params = [desde, hasta];

    // Verificar si se proporcionó el nombre de usuario y agregarlo como filtro
    if (nombreUsuario) {
      query += ` AND u.nombre_usuario = $${params.length + 1}`;
      params.push(nombreUsuario);
    }

    query += ` ORDER BY e.id_encabezadoarqueo, e.fechacreacion DESC`;

    const result = await arqueo.query(query, params);
    return result.rows;
  } finally {
    arqueo.release();
  }
};


export const getFilterFechaReporte = async (fecha, nombreUsuario) => {
  const arqueo = await pool.connect();
  try {
    let query = `
      SELECT DISTINCT ON (e.id_encabezadoarqueo)
        e.id_encabezadoarqueo,
        e.caja_id,
        e.usuario_id,
        e.estado,
        e.comentario,
        e.fechacreacion,
        d.tipodinero AS tipoDinero,
        d.valor,
        d.cantidad,
        c.nombre AS nombre_caja,
        u.nombre_usuario
      FROM encabezadoarqueo e 
      LEFT JOIN detallearqueo d ON e.id_encabezadoarqueo = d.encabezadoarqueo_id
      LEFT JOIN caja c ON c.id_caja = e.caja_id
      LEFT JOIN usuario u ON u.id_usuario = e.usuario_id
      WHERE DATE_TRUNC('day', e.fechacreacion) = $1`;

    const params = [fecha];

    // Verificar si se proporcionó el nombre de usuario y agregarlo como filtro
    if (nombreUsuario) {
      query += ` AND u.nombre_usuario = $2`;
      params.push(nombreUsuario);
    }

    query += ` ORDER BY e.id_encabezadoarqueo, e.fechacreacion DESC`;

    const result = await arqueo.query(query, params);
    return result.rows;
  } finally {
    arqueo.release();
  }
};




// Función para obtener los detalles de un arqueo específico
export const getDetallesArqueoById = async (encabezadoarqueoId) => {
  const client = await pool.connect();
  console.log(encabezadoarqueoId)
  try {
    const query = 'SELECT * FROM detallearqueo WHERE encabezadoarqueo_id = $1 ORDER BY id_detalle_arqueo';
    const result = await client.query(query, [encabezadoarqueoId]);
    client.release();
    if (result.rows.length === 0) {
      return { error: 'No se encontraron detalles para el arqueo especificado.' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error al obtener los detalles del arqueo:', error);
    throw error; 
  }
};

export default { addEncabezadoarqueo, getAllArqueo, getArqueoById, updateArqueoById, getFilterFecha, getDetallesArqueoById  };
