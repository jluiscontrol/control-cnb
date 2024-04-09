import pool from '../database.js';

export async function getOperationsReport(userId, id_caja, tipodocumento, startDate, endDate, entidad, tipoTransaccion) {
  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        operaciones.id_operacion,
        operaciones.numtransaccion,
        entidadbancaria.entidad,
        tipotransaccion.nombre AS tipo_transaccion,
        operaciones.valor,
        operaciones.saldocomision,
        usuario.nombre_usuario,
        persona.nombre AS nombre_persona,
        operaciones.referencia,
        operaciones.comentario,
        TO_CHAR(operaciones.fecha_registro, 'YYYY-MM-DD') AS fecha_registro
      FROM operaciones
      JOIN entidadbancaria ON operaciones.id_entidadbancaria = entidadbancaria.id_entidadbancaria
      JOIN tipotransaccion ON operaciones.id_tipotransaccion = tipotransaccion.id_tipotransaccion
      JOIN usuario ON operaciones.id_usuario = usuario.id_usuario
      JOIN persona ON operaciones.id_persona = persona.id_persona
      `;
    let params = [];
    let paramCount = 1;
    let whereAdded = false;
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
      query += ` entidadbancaria.entidad = $${paramCount++}`;
      params.push(entidad);
      whereAdded = true;
    }
    if (tipoTransaccion) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` tipotransaccion.nombre = $${paramCount++}`;
      params.push(tipoTransaccion);
      whereAdded = true;
    }
    if (startDate && endDate) {
      const hastaFinDia = new Date(endDate);
      hastaFinDia.setHours(23, 59, 59, 999);
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` operaciones.fecha_registro BETWEEN $${paramCount++} AND $${paramCount++}`;
      params.push(startDate, hastaFinDia);
    }
    query += ' ORDER BY operaciones.fecha_registro';
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}


export default {
  getOperationsReport
};
