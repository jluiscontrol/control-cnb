import pool from '../database.js';

export async function getOperationsReport(userId, id_caja, tipodocumento, startDate, endDate, entidad, tipoTransaccion, estado) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        operaciones.id_operacion,
        operaciones.numtransaccion,
        entidadbancaria.entidad,
        tipotransaccion.nombre AS tipo_transaccion,
        tipotransaccion.afectacaja_id,
        tipotransaccion.afectacuenta_id,
        tipotransaccion.afectacomision_id,
        operaciones.valor,
        operaciones.estado,
        operaciones.saldocomision,
        usuario.nombre_usuario,
        persona.nombre AS nombre_persona,
        persona.cedula AS cedula_persona,
        operaciones.referencia,
        operaciones.comentario,
        TO_CHAR(operaciones.fecha_registro, 'YYYY-MM-DD') AS fecha_registro
      FROM operaciones
      JOIN entidadbancaria ON operaciones.id_entidadbancaria = entidadbancaria.id_entidadbancaria
      JOIN tipotransaccion ON operaciones.id_tipotransaccion = tipotransaccion.id_tipotransaccion
      JOIN usuario ON operaciones.id_usuario = usuario.id_usuario
      LEFT JOIN persona ON operaciones.id_persona = persona.id_persona
    `;
    let params = [];
    let paramCount = 1;
    let whereAdded = false;
    if (estado) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.estado = $${paramCount++}`;
      params.push(estado);
      whereAdded = true;
    } else {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.estado = true`;
      whereAdded = true;
    }
    if (tipodocumento) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.tipodocumento = $${paramCount++}`;
      params.push(tipodocumento);
      whereAdded = true;
    }
    if (userId) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.id_usuario = $${paramCount++}`;
      params.push(userId);
      whereAdded = true;
    }
    if (id_caja) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.id_caja = $${paramCount++}`;
      params.push(id_caja);
      whereAdded = true;
    }
    if (entidad) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.id_entidadbancaria = $${paramCount++}`;
      params.push(entidad);
      whereAdded = true;
    }
    if (tipoTransaccion) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.id_tipotransaccion = $${paramCount++}`;
      params.push(tipoTransaccion);
      whereAdded = true;
    }
    if (startDate && endDate) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.fecha_registro BETWEEN $${paramCount++} AND (DATE_TRUNC('day', $${paramCount++}::timestamp with time zone) + INTERVAL '1 day' - INTERVAL '1 second')`;
      params.push(startDate, endDate);
    }
    query += ' ORDER BY operaciones.fecha_registro';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateOperationStatus(id_operacion, newState, comentario) {
  const client = await pool.connect();
  try {

    await client.query('BEGIN');

    const updateQuery = `
      UPDATE operaciones
      SET estado = $1, comentario = $2 
      WHERE id_operacion = $3
      RETURNING id_operacion, estado, comentario;
    `;

    const updateResult = await client.query(updateQuery, [newState, comentario, id_operacion]);
    if (updateResult.rowCount === 0) {
      throw new Error(`Operación con id ${id_operacion} no encontrada.`);
    }

    await client.query('COMMIT');
    return updateResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getCajasReport(startDate, endDate, caja_id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM public.get_operaciones_por_fecha($1, $2, $3)',
      [startDate, endDate, caja_id]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export default {
  getOperationsReport,
  updateOperationStatus,
  getCajasReport
};