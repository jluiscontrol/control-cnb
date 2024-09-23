import pool from '../database.js';

async function addEncabezadoarqueo(encabezadoarqueo, detalles) {
  const arqueo = await pool.connect();
  try {
    const { caja_id, usuario_id, comentario, fecha, tipo_documento } = encabezadoarqueo;
    if (!caja_id || !usuario_id || !comentario || !detalles || detalles.length === 0  || !fecha || !tipo_documento  ) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar si ya existe un arqueo para el mismo usuario en la misma fecha
    // const arqueoExistente = await arqueo.query(`
    //   SELECT * 
    //     FROM encabezadoarqueo 
    //   WHERE 
    //     caja_id = $1 AND 
    //     usuario_id = $2 AND 
    //     DATE_TRUNC('day', fechacreacion) = DATE_TRUNC('day', $3::timestamp)`, [caja_id, usuario_id, fechaFormateada]);
    // if (arqueoExistente.rows.length > 0) {
    //   throw new Error('Ya existe un arqueo para este usuario en esta caja en la fecha actual');
    // }

    // Insertar el encabezado del arqueo
    const arqueoInsertResult = await arqueo.query('INSERT INTO encabezadoarqueo(caja_id, usuario_id, comentario, fechacreacion, tipo_documento, estado) VALUES($1, $2, $3, $4, $5, $6) RETURNING id_encabezadoarqueo', [caja_id, usuario_id, comentario, fecha, tipo_documento, true]);    
    const encabezadoarqueoId = arqueoInsertResult.rows[0].id_encabezadoarqueo;

    // Insertar cada detalle del arqueo
    for (const detalle of detalles) {
      const { tipodinero, valor, cantidad } = detalle;
      await arqueo.query('INSERT INTO detallearqueo(tipodinero, valor, cantidad, encabezadoarqueo_id) VALUES($1, $2, $3, $4)', [tipodinero, valor, cantidad, encabezadoarqueoId]);
    }

    return encabezadoarqueoId;
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
    throw error;
  } finally {
    client.release();
  }
}

// Función para actualizar el arqueo por su ID
export const updateArqueoById = async (encabezadoarqueoId, newData) => {
  const client = await pool.connect();
  try {
    // Actualizar los datos del encabezado del arqueo
    const query = 'UPDATE encabezadoarqueo SET comentario = $1, tipo_documento = $2 WHERE id_encabezadoarqueo = $3';
    const result = await client.query(query, [newData.comentario, newData.tipo_documento,  encabezadoarqueoId]);

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

export const valoresArqueoByApertura = async (encabezadoarqueoId) => {
  const client = await pool.connect();
  try {
    const encabezadoQuery = `
      SELECT caja_id, usuario_id, DATE(fechacreacion) as fechacreacion
      FROM encabezadoarqueo
      WHERE id_encabezadoarqueo = $1
    `;

    const encabezadoResult = await client.query(encabezadoQuery, [encabezadoarqueoId]);

    if (encabezadoResult.rows.length === 0) {
      return { error: 'No se encontró el encabezado de arqueo especificado.' };
    }

    const { caja_id, usuario_id, fechacreacion } = encabezadoResult.rows[0];

    // Consultar los totales de apertura (tipo_documento = 'APE') y arqueo (tipo_documento = 'ARQ') para el mismo usuario, caja y fecha de creación
    const query = `
      SELECT ea.tipo_documento, ROUND(SUM(da.valor * da.cantidad)::numeric, 2) AS total
      FROM detallearqueo da INNER JOIN encabezadoarqueo ea ON da.encabezadoarqueo_id = ea.id_encabezadoarqueo
      WHERE ea.caja_id = $1 AND ea.usuario_id = $2 AND DATE(ea.fechacreacion) = $3
      GROUP BY ea.tipo_documento
      ORDER BY ea.tipo_documento;
    `;

    const result = await client.query(query, [caja_id, usuario_id, fechacreacion]);
    const documentos = {
      APE: 0.00,
      ARQ: 0.00
    };

    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        documentos[row.tipo_documento] = row.total;
      });
    }

    return [
      { tipo_documento: 'APE', total: documentos.APE },
      { tipo_documento: 'ARQ', total: documentos.ARQ }
    ];

  } catch (error) {
    console.error('Error al obtener los detalles del arqueo y apertura:', error);
    throw error;
  } finally {
    client.release();
  }
};


export default {
  addEncabezadoarqueo,
  getAllArqueo,
  getArqueoById,
  updateArqueoById,
  getFilterFecha,
  getDetallesArqueoById,
  valoresArqueoByEncabezadoId,
  valoresArqueoByApertura
};
