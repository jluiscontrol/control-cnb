import pool from '../database.js';

export const createRutaVisible = async (rutaVisible) => {
  const { id_rol, id_usuario, ruta, activo } = rutaVisible;
  const result = await pool.query(
    'INSERT INTO rutavisible (id_rol, id_usuario, ruta, activo) VALUES ($1, $2, $3, $4) RETURNING *',
    [id_rol, id_usuario, ruta, activo]
  );
  return result.rows[0];
};

export const deleteRutaVisible = async (id) => {
  const result = await pool.query(
    'DELETE FROM rutavisible WHERE id_rutavisible = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

export const getRutasVisibles = async ( id_usuario) => {
  const result = await pool.query(`
    SELECT rv.*, r.ruta
    FROM rutavisible rv
    JOIN ruta r ON rv.id_ruta = r.id_ruta
    WHERE rv.id_usuario = $1 AND rv.activo = true`,
    [id_usuario]
  );
  return result.rows;
};

export default { createRutaVisible, deleteRutaVisible, getRutasVisibles}