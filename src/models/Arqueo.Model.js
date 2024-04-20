import pool from '../database.js';

async function addEncabezadoarqueo(encabezadoarqueo, detalles) {
  const arqueo = await pool.connect();
  try {
    const { caja_id, usuario_id, comentario } = encabezadoarqueo;

    if (!caja_id || !usuario_id || !comentario || !detalles || detalles.length === 0) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar si ya existe un arqueo para el mismo usuario en la misma fecha
    // Obtener la fecha actual en la zona horaria de Guayaquil, Ecuador (GMT-5)
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString();
    console.log('fecha actual:', fechaFormateada)
    console.log('fecha formateada:', fechaFormateada)
    const arqueoExistente = await arqueo.query(`
      SELECT * 
        FROM encabezadoarqueo 
      WHERE 
        caja_id = $1 AND 
        usuario_id = $2 AND 
        DATE_TRUNC('day', fechacreacion) = DATE_TRUNC('day', $3::timestamp)`, [caja_id, usuario_id, fechaFormateada]);
    if (arqueoExistente.rows.length > 0) {
      throw new Error('Ya existe un arqueo para este usuario en esta caja en la fecha actual');
    }
   


    // Insertar el encabezado del arqueo
    const arqueoInsertResult = await arqueo.query('INSERT INTO encabezadoarqueo(caja_id, usuario_id, comentario, estado) VALUES($1, $2, $3, $4) RETURNING id_encabezadoarqueo', [caja_id, usuario_id, comentario, true]);    const encabezadoarqueoId = arqueoInsertResult.rows[0].id_encabezadoarqueo;

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
export const getArqueoById = async (encabezadoarqueoId) => {
  const client = await pool.connect();
  try {

    const query = 'SELECT * FROM encabezadoarqueo WHERE id_encabezadoarqueo = $1';
    const result = await client.query(query, [encabezadoarqueoId]);

    if (result.rows.length === 0) {
      return { error: 'Arqueo no encontrado' }; // Devuelve un objeto con el mensaje de error
    }
    return result.rows[0]; // Devuelve la entidad bancaria encontrada
  } catch (error) {
    console.error('Error al obtener el arqueo por ID:', error);
    throw error; // Relanza el error para que sea manejado por el controlador
  } finally {
    client.release();
  }
}

// Función para actualizar el arqueo por su ID
export const updateArqueoById = async (encabezadoarqueoId, newData) => {
  const client = await pool.connect();
  try {
    // Actualizar los datos del encabezado del arqueo
    const query = 'UPDATE encabezadoarqueo SET comentario = $1 WHERE id_encabezadoarqueo = $2';
    const result = await client.query(query, [newData.comentario, encabezadoarqueoId]);

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

    return { message: 'Arqueo actualizado correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar el arqueo: ' + error.message);
  } finally {
    client.release();
  }
};

export const getFilterFecha = async (desde, hasta, usuario_id, id_caja) => {
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
      WHERE e.fechacreacion BETWEEN $1 AND (DATE_TRUNC('day', $2::timestamp with time zone) + INTERVAL '1 day' - INTERVAL '1 second')
      `;

            let params = [desde, hasta];
            let paramCount = 3;

            // Verificar si se proporcionó el nombre de usuario y agregarlo como filtro
            if (usuario_id) {
              query += ` AND e.usuario_id = $${paramCount++}`;
              params.push(usuario_id);
            }

            if (id_caja) {
              query += ` AND c.id_caja = $${paramCount++}`;
              params.push(id_caja);
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
    if (result.rows.length === 0) {
      return { error: 'No se encontraron detalles para el arqueo especificado.' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error al obtener los detalles del arqueo:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const valoresArqueoByEncabezadoId = async (encabezadoarqueoId) => {
  const client = await pool.connect();
  try {
    const query = `
    SELECT 
        ROUND(SUM(valor * cantidad)::numeric, 2) AS total
    FROM 
        detallearqueo
    WHERE 
        encabezadoarqueo_id = $1;`;
    const result = await client.query(query, [encabezadoarqueoId]);
    if (result.rows.length === 0) {
      return { error: 'No se encontraron detalles para el arqueo especificado.' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error al obtener los detalles del arqueo:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default {
  addEncabezadoarqueo,
  getAllArqueo,
  getArqueoById,
  updateArqueoById,
  getFilterFecha,
  getDetallesArqueoById,
  valoresArqueoByEncabezadoId
};
