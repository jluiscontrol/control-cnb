import pool from '../database.js';

//funcion para agregar tipo de transaccion
async function addTipoTransaccion(nuevoTipoTransaccion) {
  const tipotransaccion = await pool.connect();
  try {
    const { nombre, afectacaja_id, afectacuenta_id, tipodocumento } = nuevoTipoTransaccion;
    // Verificar si alguno de los campos requeridos está vacío
    if (!nombre || !afectacaja_id || !afectacuenta_id || !tipodocumento) {
      throw new Error('Todos los campos son requeridos');
    }
    // Verificar si el tipo de transacción ya existe
    const existingTipoTransaccion = await tipotransaccion.query('SELECT * FROM tipotransaccion WHERE nombre = $1', [nombre]);
    if (existingTipoTransaccion.rows.length > 0) {
      throw new Error('El tipo de transacción ya existe');
    }
    // Si el tipo de transacción no existe, procedemos a hacer el insert
    const result = await tipotransaccion.query('INSERT INTO tipotransaccion(nombre, afectacaja_id, afectacuenta_id, tipodocumento) VALUES($1, $2, $3, $4) RETURNING *', [nombre, afectacaja_id, afectacuenta_id, tipodocumento]);
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
      SELECT tt.id_tipotransaccion, tt.nombre AS tipo_transaccion, tt.tipodocumento, ac.nombre AS afectacion_caja, acc.nombre AS afectacion_cuenta
      FROM tipotransaccion tt
      INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta
      ORDER BY tt.id_tipotransaccion; 
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

//funcion para obtener todos los tipos de transacciones activas
async function getAllTiposTransaccionActivos() {
  const client = await pool.connect();
  try {
    const query = `
    SELECT tt.id_tipotransaccion,
    tt.nombre AS tipo_transaccion, 
    tt.estado AS estado,
    ac.nombre AS afectacion_caja, 
    acc.nombre AS afectacion_cuenta
          FROM tipotransaccion tt
          INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
          INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta 
        WHERE tt.estado = true
        ORDER BY tt.id_tipotransaccion; 
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// funcion para el tipo de transacion por Id
export const getTipoTransaccionById = async (tipotransaccionId) => {
  try {

    const transaccion = await pool.connect();
    const query = `
      SELECT tt.id_tipotransaccion, tt.nombre AS tipo_transaccion, 
      ac.id_afectacaja AS id_afectacaja, 
      ac.nombre AS afectacion_caja, 
      acc.id_afectacuenta AS id_afectacuenta,
      acc.nombre AS afectacion_cuenta
      FROM tipotransaccion tt 
      INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta
      WHERE tt.id_tipotransaccion = $1
      ORDER tt.id_tipotransaccion;
    `;
    const result = await transaccion.query(query, [tipotransaccionId]);
    transaccion.release();
    if (result.rows.length === 0) {
      return { error: 'Tipo transaccion no encontrada' }; // Devuelve un objeto con el mensaje de error
    }
    return result.rows[0]; // Devuelve la Tipo transaccion encontrada
  } catch (error) {
    console.error('Error al obtener el tipo transaccion por ID:', error);
    return { error: 'Error en el servidor' }; // Devuelve un objeto con el mensaje de error
  }
}
export const updateTipoTransaccionId = async (tipotransaccionId, newData) => {
  try {
    const transaccion = await pool.connect();
    // Construir la consulta SQL de actualización
    const query = 'UPDATE tipotransaccion  SET nombre = $1, afectacaja_id = $2, afectacuenta_id = $3 WHERE id_tipotransaccion = $4';
    // Ejecutar la consulta SQL con los nuevos datos y el ID de la entidad bancaria
    await transaccion.query(query, [newData.nombre, newData.afectacaja_id, newData.afectacuenta_id, tipotransaccionId]);
    
    // Liberar la conexión al pool de conexiones
    transaccion.release();
    
    return { message: 'Tipo de transacción actualizada correctamente.' };
  } catch (error) {
    throw new Error('Error al actualizar el tipo de transaccion: ' + error.message);
  }
};

//funcion para obtener todos los datos de Afecta caja
async function getAllAfectaCaja() {
  const client = await pool.connect();
  try {
    const query = `
          SELECT * FROM afectacaja ORDER BY id_afectacaja
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

//funcion para obtener todos los datos de Afecta cuenta
async function getAllAfectaCuenta() {
  const client = await pool.connect();
  try {
    const query = `
          SELECT * FROM afectacuenta ORDER BY id_afectacuenta
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

async function getAllTiposTransaccionByTipoDocumento(tipodocumento) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT tt.id_tipotransaccion, tt.nombre AS tipo_transaccion, tt.tipodocumento, ac.nombre AS afectacion_caja, acc.nombre AS afectacion_cuenta
      FROM tipotransaccion tt
      INNER JOIN afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      INNER JOIN afectacuenta acc ON tt.afectacuenta_id = acc.id_afectacuenta
      WHERE tt.tipodocumento = $1
      ORDER BY tt.id_tipotransaccion; 
    `;
    const result = await client.query(query, [tipodocumento]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Exportar las funciones del modelo
export default { addTipoTransaccion, 
              getAllTiposTransaccion,
              updateTipoTransaccionId, 
              getTipoTransaccionById, 
              getAllAfectaCaja,
              getAllAfectaCuenta,
              getAllTiposTransaccionActivos,
              getAllTiposTransaccionByTipoDocumento};