import pool from '../database.js';
import { consultarLicenciaCliente } from '../helpers/funciones.js';

export async function getLast15Operations() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
        SELECT o.*, e.entidad, t.nombre as tipo_transaccion, c.nombre as caja
        FROM operaciones o 
        JOIN entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria 
        JOIN tipotransaccion t ON o.id_tipotransaccion = t.id_tipotransaccion 
        JOIN caja c ON o.id_caja = c.id_caja
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
    SELECT 
      EXTRACT(MONTH FROM o.fecha_registro) AS mes,
      SUM(o.valor) AS total_valor,
      SUM(o.saldocomision) AS total_saldocomision
    FROM 
        operaciones o
    INNER JOIN 
        entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
    GROUP BY 
        mes
    ORDER BY 
        mes;
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
        AND fecha_registro::date = CURRENT_DATE
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
      SELECT 
      SUM(CASE 
        WHEN tt.afectacaja_id = 1 THEN o.valor
        WHEN tt.afectacaja_id = 2 THEN -o.valor
        ELSE 0
      END) AS total_saldo
      FROM operaciones o
      JOIN tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
      WHERE  o.tipodocumento = 'OPR'
      `);
    return result.rows[0].total_saldo;
  } finally {
    client.release();
  }
}


export async function getLicenciaCliente(nident) {
  try {
    const { data } = await consultarLicenciaCliente(nident);

    // Convertir la fecha de pago y los meses a un objeto Date
    const fechaPago = new Date(data.fecha_pago.split(' ')[0] + 'T00:00:00Z');
    const meses = Number(data.meses);

    // Calcular la fecha de vencimiento de la licencia
    const fechaVencimiento = new Date(fechaPago.setMonth(fechaPago.getMonth() + meses));

    // Calcular los días restantes
    const fechaActual = new Date();
    const diasRestantes = Math.ceil((fechaVencimiento - fechaActual) / (1000 * 60 * 60 * 24));

    // Devolver solo los días restantes
    return diasRestantes;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export default {
  getLast15Operations,
  getTotalCommissions,
  getTodayCommissionsByBank,
  getMonthlyOperationsDataForDashboard,
  getTotalOperaciones,
  getTotalComisiones,
  getTotalSaldoCaja,
  getLicenciaCliente
};
