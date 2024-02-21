import pool from '../database.js';


async function addTipoTransaccion(tipoTransaccion) {
  const banco = await pool.connect();
  try {
    const { entidad, acronimo, estado, comision, sobregiro } = tipoTransaccion;
    if (!entidad || !acronimo || !estado || !comision || !sobregiro) {
      throw new Error('Todos los campos son requeridos');
    }
    //verificar si el banco ya existe
    const existingBanco = await banco.query('SELECT * FROM entidadbancaria WHERE entidad = $1', [entidad]);
    if (existingBanco.rows.length > 0) {
        throw new Error('La entidad bancaria ya existe')
    }
    //Si el banco no existe, procedemos a hacer el insert
    const result = await banco.query('INSERT INTO entidadbancaria(entidad, acronimo, estado, comision, sobregiro) VALUES( $1, $2, $3, $4, $5 ) RETURNING *', [entidad, acronimo, estado, comision, sobregiro]);
    return result.rows[0];
  } finally { 
    banco.release();
  }
}

async function addTipoTransaccion(nuevoTipoTransaccion) {
  const tipotransaccion = await pool.connect();
  try {
    const { nombre, afectacajaId, afectacuentaId } = nuevoTipoTransaccion;
    
    // Verificar si alguno de los campos requeridos está vacío
    if (!nombre || !afectacajaId || !afectacuentaId) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar si el tipo de transacción ya existe
    const existingTipoTransaccion = await tipotransaccion.query('SELECT * FROM tipotransaccion WHERE nombre = $1', [nombre]);
    if (existingTipoTransaccion.rows.length > 0) {
      throw new Error('El tipo de transacción ya existe');
    }

    // Si el tipo de transacción no existe, procedemos a hacer el insert
    const result = await tipotransaccion.query('INSERT INTO tipotransaccion(nombre, afectacaja_id, afectacuenta_id) VALUES($1, $2, $3) RETURNING *', [nombre, afectacajaId, afectacuentaId]);
    
    return result.rows[0];
  } finally {
    tipotransaccion.release();
  }
}

// Exportar las funciones del modelo
export default { addTipoTransaccion};