
import pool from '../database.js';

//agregar una nueva caja
export async function addComision({ valorcomision, entidadbancaria_id, tipotransaccion_id, estado = true }) {
  const comisionDatos = await pool.connect();
  let comision;
  try {
    await comisionDatos.query("BEGIN");

    // Verificar si la comisión ya se ha asignado anteriormente
    const existingComisionAsignadaQuery = `SELECT * FROM comision WHERE entidadbancaria_id = $1`;
    const existingComisionResult = await comisionDatos.query(existingComisionAsignadaQuery, [entidadbancaria_id]);
    if (existingComisionResult.rows.length > 0) {
      return { exists: true };
    }

    // Insertar comision
    const insertQuery = `INSERT INTO comision(valorcomision, entidadbancaria_id, tipotransaccion_id, estado) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await comisionDatos.query(insertQuery, [JSON.stringify(valorcomision), entidadbancaria_id, tipotransaccion_id, estado]);

    await comisionDatos.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (comision) await comisionDatos.query("ROLLBACK");
    throw error;
  } finally {
    comisionDatos.release();
  }
}
export async function getAllCajas() {
  const cajas = await pool.connect();
  try {
    const query = `SELECT * FROM comision`;
    const resultado = await cajas.query(query);
    return resultado.rows;
  } finally {
    cajas.release();
  }
}





export default { addComision }