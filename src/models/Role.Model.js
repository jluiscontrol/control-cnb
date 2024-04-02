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

  export async function getRolById (id) {
    const rol = await pool.connect();
    try {
      const query = `SELECT id_rol FROM usuario_rol WHERE id_usuario = $1`;
      const resultado = await rol.query(query, [id]);
      return resultado.rows[0];
    } finally {
      rol.release();
    }
  }

  export default { getAllRolesModel, getRolById }