import pool from '../database.js';

export async function getLast15Operations() {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT o.*, e.entidad, t.nombre as tipo_transaccion 
        FROM operaciones o 
        JOIN entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria 
        JOIN tipotransaccion t ON o.id_tipotransaccion = t.id_tipotransaccion 
        WHERE DATE(o.fecha_registro) = CURRENT_DATE 
        ORDER BY o.fecha_registro DESC 
        LIMIT 15
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  export async function getTotalCommissions() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT SUM(saldocomision) as total_comision 
        FROM operaciones 
        WHERE tipodocumento = 'OPR'
      `);
      return result.rows[0].total_comision;
    } finally {
      client.release();
    }
  }

  export async function getTodayCommissionsByBank() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT e.entidad, SUM(o.saldocomision) as total_comision 
        FROM operaciones o
        INNER JOIN entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
        WHERE o.tipodocumento = 'OPR' AND o.fecha_registro::date = CURRENT_DATE
        GROUP BY e.entidad
      `);
      return result.rows.map(row => [row.entidad, row.total_comision]);
    } finally {
      client.release();
    }
  }

  export default {
    getLast15Operations,
    getTotalCommissions,
    getTodayCommissionsByBank
  };
    