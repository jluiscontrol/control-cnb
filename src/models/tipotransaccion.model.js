import pool from '../database.js';

//funcion para agregar tipo de transaccion
async function addTipoTransaccion(nuevoTipoTransaccion) {
  const tipotransaccion = await pool.connect();
  try {
    const { nombre, afectacaja_id, afectacuenta_id } = nuevoTipoTransaccion;

    // Verificar si alguno de los campos requeridos está vacío
    if (!nombre || !afectacaja_id || !afectacuenta_id) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar si el tipo de transacción ya existe
    const existingTipoTransaccion = await tipotransaccion.query('SELECT * FROM tipotransaccion WHERE nombre = $1', [nombre]);
    if (existingTipoTransaccion.rows.length > 0) {
      throw new Error('El tipo de transacción ya existe');
    }

    // Si el tipo de transacción no existe, procedemos a hacer el insert
    const result = await tipotransaccion.query('INSERT INTO tipotransaccion(nombre, afectacaja_id, afectacuenta_id) VALUES($1, $2, $3) RETURNING *', [nombre, afectacaja_id, afectacuenta_id]);

    return result.rows[0];
  } finally {
    tipotransaccion.release();
  }
}
//funcion para obtener todos los tipos de transacciones
async function getAllTiposTransaccion() {
  const client = await pool.connect();
  try {
    const query = `
      SELECT tt.id_tipotransaccion, tt.nombre AS tipo_transaccion, ac.nombre AS afectacion_caja, acc.nombre AS afectacion_cuenta
      FROM tipotransaccion tt
      INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta;
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}
// funcion para el tipo de transacion por Id
export const getTipoTransaccionId = async (req, res) => {
  /*try {
    const transaccion = await pool.connect();
    const query = `
      SELECT tt.id_tipotransaccion, tt.nombre AS tipo_transaccion, 
      ac.nombre AS afectacion_caja, 
      acc.nombre AS afectacion_cuenta
      FROM tipotransaccion tt
      INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta
      WHERE tt.id_tipotransaccion = $1
    `;
    const result = await transaccion.query(query, [tipotransaccionId]);
    transaccion.release();
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener el tipo de transacción por ID:', error);
    throw error;
  }*/
}


// Exportar las funciones del modelo
export default { addTipoTransaccion, getAllTiposTransaccion, getTipoTransaccionId };