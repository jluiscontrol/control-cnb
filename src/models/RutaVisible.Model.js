import pool from '../database.js';

export const createOrUpdateRutaVisible = async (rutaVisible) => {
  const { id_usuario, id_ruta, activo } = rutaVisible;

  // Primero, intenta actualizar la fila existente
  const updateResult = await pool.query(`
    UPDATE rutavisible 
    SET activo = $1 
    WHERE id_usuario = $2 AND id_ruta = $3
    RETURNING *`,
    [activo, id_usuario, id_ruta]
  );

  // Si se actualizó una fila, devuélvela
  if (updateResult.rowCount > 0) {
    return updateResult.rows[0];
  }

  // Si no se actualizó ninguna fila, inserta una nueva
  const insertResult = await pool.query(`
    INSERT INTO rutavisible (id_usuario, id_ruta, activo) 
    VALUES ($1, $2, $3) 
    RETURNING *`,
    [id_usuario, id_ruta, activo]
  );

  return insertResult.rows[0];
};

export const getAllRutas = async () => {
  const result = await pool.query('SELECT * FROM ruta');
  return result.rows;
}

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

export default { getAllRutas, getRutasVisibles, createOrUpdateRutaVisible}