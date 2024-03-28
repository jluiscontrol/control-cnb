import pool from '../database.js';

export async function getOperationsReport(userId, startDate, endDate) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          operaciones.numtransaccion,
          entidadbancaria.entidad,
          tipotransaccion.nombre AS tipo_transaccion,
          operaciones.valor,
          operaciones.saldocomision,
          usuario.nombre_usuario,
          persona.nombre AS nombre_persona,
          operaciones.referencia,
          operaciones.comentario,
          operaciones.fecha_registro
        FROM operaciones
        JOIN entidadbancaria ON operaciones.id_entidadbancaria = entidadbancaria.id_entidadbancaria
        JOIN tipotransaccion ON operaciones.id_tipotransaccion = tipotransaccion.id_tipotransaccion
        JOIN usuario ON operaciones.id_usuario = usuario.id_usuario
        JOIN persona ON usuario.persona_id = persona.id_persona`;
      let params = [];
      let paramCount = 1;
      if (userId) {
        query += ` WHERE operaciones.id_usuario = $${paramCount++}`;
        params.push(userId);
      }
      if (startDate && endDate) {
        // Ajusta la fecha 'hasta' para incluir todo el último día
        const hastaFinDia = new Date(endDate);
        hastaFinDia.setHours(23, 59, 59, 999);
        query += userId ? ' AND' : ' WHERE';
        query += ` operaciones.fecha_registro BETWEEN $${paramCount++} AND $${paramCount++}`;
        params.push(startDate, hastaFinDia);
      }
      query += ' ORDER BY operaciones.fecha_registro DESC';
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }



export default {
    getOperationsReport
};
