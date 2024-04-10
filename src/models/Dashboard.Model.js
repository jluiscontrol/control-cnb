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
        WHERE tipodocumento = 'OPR' AND fecha_registro::date = CURRENT_DATE
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

  export async function getMonthlyOperationsDataForDashboard() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT EXTRACT(MONTH FROM o.fecha_registro) as mes,
               SUM(o.valor) as total_valor,
               SUM(o.saldocomision) as total_saldocomision
        FROM operaciones o
        INNER JOIN entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
        GROUP BY mes
        ORDER BY mes
      `);
      return result.rows.map(row => ({
        mes: row.mes,
        total_valor: row.total_valor,
        total_saldocomision: row.total_saldocomision
      }));
    } finally {
      client.release();
    }
  }

  export async function getTotalOperaciones() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as total_operaciones
        FROM operaciones
        WHERE tipodocumento = 'OPR'
      `);
      return result.rows[0].total_operaciones;
    } finally {
      client.release();
    }
  }

  export async function getTotalComisiones() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT SUM(saldocomision) as total_comisiones
        FROM operaciones
        WHERE tipodocumento = 'OPR'
      `);
      return result.rows[0].total_comisiones;
    } finally {
      client.release();
    }
  }

  export async function getTotalSaldoCaja() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT SUM(saldocaja) as total_saldo
        FROM saldos
      `);
      return result.rows[0].total_saldo;
    } finally {
      client.release();
    }
  }
  

  export default {
    getLast15Operations,
    getTotalCommissions,
    getTodayCommissionsByBank,
    getMonthlyOperationsDataForDashboard,
    getTotalOperaciones,
    getTotalComisiones,
    getTotalSaldoCaja
  };
    