import pool from "../database.js";


export const insertOrUpdatePermiso = async (id_rol, id_usuario, entidad, accion, permitido) => {
  try {
      // Consulta SQL para insertar o actualizar un permiso
      const query = `
      INSERT INTO permisos (id_rol, id_usuario, entidad, accion, permitido)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id_rol, id_usuario, entidad, accion)
      DO UPDATE SET permitido = $5
      RETURNING *
      `;
      
      // Ejecuta la consulta con los valores proporcionados
      const { rows } = await pool.query(query, [id_rol, id_usuario, entidad, accion, permitido]);
      
      return rows[0]; // Devuelve el nuevo permiso insertado o actualizado
  } catch (error) {
      throw new Error(`Error al insertar o actualizar permiso: ${error.message}`);
  }
};

export default { insertOrUpdatePermiso };

