import pool from '../database.js';


//Obtener todas las cajas / activas e inactivas
export async function getAllRolesModel() {
    const roles = await pool.connect();
    try {
      const query = `SELECT * FROM rol`;
      const resultado = await roles.query(query);
      return resultado.rows;
    } finally {
      roles.release();
    }
  }

  export default { getAllRolesModel }