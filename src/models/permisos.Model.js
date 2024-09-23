import pool from "../database.js";


export const insertOrUpdatePermiso = async (id_usuario, estado, id_listapermisos) => {
  try {
    // Consulta SQL para insertar o actualizar un permiso
    const query = `
    INSERT INTO permisos (id_usuario, estado, id_listapermisos)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_usuario, id_listapermisos)
    DO UPDATE SET estado = EXCLUDED.estado
    RETURNING *;
      `;

    // Ejecuta la consulta con los valores proporcionados
    const { rows } = await pool.query(query, [id_usuario, estado, id_listapermisos]);

    return rows[0]; // Devuelve el nuevo permiso insertado o actualizado
  } catch (error) {
    throw new Error(`Error al insertar o actualizar permiso: ${error.message}`);
  }
};

export const getAllPermisos = async () => {
  try {
    // Consulta SQL para obtener todos los permisos
    const query = `
      SELECT * FROM listapermisos
      `;

    // Ejecuta la consulta
    const { rows }
      = await pool.query(query);

    return rows; // Devuelve todos los permisos
  }
  catch (error) {
    throw new Error(`Error al obtener permisos: ${error.message}`);
  }
};


export const getPermisosUsuario = async (id_usuario) => {
  try {
    // Consulta SQL para obtener los permisos de un usuario
    const query = `
      SELECT p.*, lp.nombre
      FROM permisos p
      JOIN listapermisos lp ON p.id_listapermisos = lp.id_listapermisos
      WHERE p.id_usuario = $1 AND p.estado = true
      `;

    // Ejecuta la consulta con el id_usuario proporcionado
    const { rows } = await pool.query(query, [id_usuario]);

    return rows; // Devuelve los permisos del usuario
  }
  catch (error) {
    throw new Error(`Error al obtener permisos del usuario: ${error.message}`);
  }
}

export const getParametrizacion = async (id_usuario) => {
  try {
    // Consulta SQL para obtener los permisos de un usuario
    const query = `
      SELECT p.*, lp.nombre
      FROM permisos p
      JOIN listapermisos lp ON p.id_listapermisos = lp.id_listapermisos
      WHERE p.id_usuario = $1 AND p.estado = true
      `;

    // Ejecuta la consulta con el id_usuario proporcionado
    const { rows } = await pool.query(query, [id_usuario]);

    return rows; // Devuelve los permisos del usuario
  }
  catch (error) {
    throw new Error(`Error al obtener permisos del usuario: ${error.message}`);
  }
}



export default {
  insertOrUpdatePermiso,
  getAllPermisos,
  getPermisosUsuario,
  getParametrizacion
};

