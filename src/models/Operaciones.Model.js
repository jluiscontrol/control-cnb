import pool from '../database.js';

export async function addOperaciones(operaciones) {
  const operacion = await pool.connect();
  let client;

  try {
    client = await operacion.query("BEGIN");

    const {
      id_entidadbancaria,
      id_tipotransaccion,
      id_persona,
      valor,
      referencia,
      comentario,
      numtransaccion,
      id_usuario,
      saldocomision,
      estado = true,
      tipodocumento
    } = operaciones;

    // Validar campos obligatorios
    if (!id_entidadbancaria || !id_tipotransaccion || !valor || !tipodocumento) {
      throw new Error('Todos los campos obligatorios deben ser proporcionados.');
    }

    // Validar tipos de datos
    if (typeof id_entidadbancaria !== 'number'
      || typeof id_tipotransaccion !== 'number'
      || typeof valor !== 'number'
    ) {
      throw new Error('Los tipos de datos de los campos son incorrectos.');
    }

    // Consultar el valor de sobregiro de la entidad bancaria
    const entidadBancariaQuery = await operacion.query(`
      SELECT sobregiro FROM entidadbancaria WHERE id_entidadbancaria = $1`, [id_entidadbancaria]);
    const sobregiro = entidadBancariaQuery.rows[0]?.sobregiro || 0;

    // Consultar el saldo disponible en la tabla de saldos
    const saldoQuery = await operacion.query(`
      SELECT saldocuenta FROM saldos WHERE entidadbancaria_id = $1`, [id_entidadbancaria]);

    if (saldoQuery.rows.length === 0) {
      throw new Error('No se encontró saldo para la entidad bancaria especificada.');
    }

    const saldoDisponible = saldoQuery.rows[0]?.saldocuenta || 0;

    // Validar que el saldo de la cuenta no exceda el límite del sobregiro
    const saldoTotal = saldoDisponible - valor;
    if (saldoTotal < -sobregiro) {
      throw new Error('La operación excede el límite del sobregiro permitido para esta entidad bancaria.');
    }

    // Insertar operación
    const result = await operacion.query(`
      INSERT INTO 
      operaciones(id_entidadbancaria, 
                  id_tipotransaccion, 
                  id_persona, 
                  valor, 
                  referencia, 
                  comentario, 
                  numtransaccion, 
                  id_usuario,
                  saldocomision,
                  estado,
                  tipodocumento) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`, [
      id_entidadbancaria,
      id_tipotransaccion,
      id_persona,
      valor,
      referencia,
      comentario,
      numtransaccion,
      id_usuario,
      saldocomision,
      estado,
      tipodocumento
    ]);

    await operacion.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (client) await operacion.query("ROLLBACK");
    throw new Error('Error al agregar operación: ' + error.message);
  } finally {
    operacion.release();
  }
}


//Funcion para obtener todas las operaciones
export async function getAllOperaciones() {
  try {
    const operaciones = await pool.connect();
    try {
      const resultado = await operaciones.query(`
      SELECT 
        o.id_operacion,
        e.entidad AS entidad,
        e.acronimo AS acronimo,
        e.sobregiro AS sobregiro,
        e.estado AS estado,
        tt.nombre AS tipotransaccion,
        o.valor AS valor_operacion,
        o.referencia AS referencia,
        o.comentario AS comentario_operacion,
        o.numtransaccion AS num_transaccion,
        o.fecha_registro AS fecha_registro_operacion,
        o.fecha_actualizacion AS fecha_actualizacion_operacion,
        SUM(o.saldocomision) OVER (PARTITION BY e.entidad, e.acronimo) AS saldocomision_operacion, 
        o.tipodocumento AS tipodocumento_operacion,
        o.estado AS estado_operacion,
        ac.nombre AS afectacion_caja,
        au.nombre AS afectacion_cuenta,
        u.nombre_usuario AS nombre_usuario_operacion,
        s.saldocuenta AS saldocuenta
      FROM 
        operaciones o
      JOIN 
        entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
      JOIN 
        tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
      LEFT JOIN
        comision co ON e.id_entidadbancaria = co.entidadbancaria_id
      LEFT JOIN
        afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      LEFT JOIN
        afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
      LEFT JOIN
        usuario u ON o.id_usuario = u.id_usuario
      LEFT JOIN
        saldos s ON s.entidadbancaria_id = e.id_entidadbancaria
      WHERE 
        o.estado = true
      ORDER BY 
        id_operacion; 
      `);

      return resultado.rows;
    } finally {
      operaciones.release();
    }
  } catch (error) {
    throw error;
  }
}




//Funcion para obtener todas las operaciones filtrando por fechas
export async function getAllOperacionesFilter(fechaDesde, fechaHasta) {
  try {
    const operaciones = await pool.connect();
    try {
      const resultado = await operaciones.query(`
      SELECT          
          e.entidad AS entidad,
          tt.nombre AS tipotransaccion,
   
          o.valor AS valor_operacion,
          o.comentario AS comentario_operacion,
          o.numtransaccion AS num_transaccion,
          o.fecha_registro AS fecha_registro_operacion,
          o.fecha_actualizacion AS fecha_actualizacion_operacion,
          co.valorcomision AS valor_comision,
          ac.nombre AS afectacion_caja,
          au.nombre AS afectacion_cuenta
      FROM 
          operaciones o
      JOIN 
          entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria

      JOIN 
          tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
      LEFT JOIN
          comision co ON e.id_entidadbancaria = co.entidadbancaria_id
      LEFT JOIN
          afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
      LEFT JOIN
          afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
      WHERE
          DATE(o.fecha_registro) >= $1 -- Fecha desde
          AND DATE(o.fecha_registro) <= $2 -- Fecha hasta
      ORDER BY 
          afectacion_caja,
          afectacion_cuenta;
      `, [fechaDesde, fechaHasta]);
      return resultado.rows;
    } finally {
      operaciones.release();
    }
  } catch (error) {
    throw error; // Re-lanzar el error para que el llamador también pueda manejarlo
  }
}

//funcion para editar una operacion
export const updateOperacionesById = async (operacionesId, newData) => {
  try {
    const client = await pool.connect();
    const query = `
          UPDATE operaciones 
          SET id_entidadbancaria = $1, 
              id_tipotransaccion = $2, 
              id_persona = $3,
              valor = $4,
              referencia = $5,
              comentario = $6,
              numtransaccion = $7,
              saldocomision = $8,
              tipodocumento = $9,
          WHERE id_operacion = $10`
      ;
    const result = await client.query(query, [newData.id_entidadbancaria,
    newData.id_tipotransaccion,
    newData.id_persona,
    newData.valor,
    newData.referencia,
    newData.comentario,
    newData.numtransaccion,
    newData.saldocomision,
    newData.tipodocumento,
      operacionesId]);
    if (result.rowCount === 0) {
      return { error: 'La operacion con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }

    client.release();
    return { message: 'Operaciòn actualizada correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar la operación: ' + error.message);
  }
};

//funcion para eliminar una operacion
export const deleteOperacionesById = async (operacionesId, newData) => {

  try {
    const client = await pool.connect();
    const query = `
          UPDATE operaciones 
          SET estado = $1 
          WHERE id_operacion = $2`
      ;
    const result = await client.query(query, [newData.estado, operacionesId]);
    if (result.rowCount === 0) {
      return { error: 'La operacion con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }

    client.release();
    return { message: 'Operación eliminada correctamente' };
  } catch (error) {
    throw new Error('Error al eliminar la operación: ' + error.message);
  }
};


export const ObtenerComisionByBankandTransa = async (newData) => {
  try {
    const client = await pool.connect();
    const query = `SELECT          
          e.valorcomision AS saldocomision,    
          WHERE entidadbancaria_id = $1 && tipotransaccion_id = $2`;
    const result = await client.query(query, [
      newData.id_tipotransaccion,
      newData.id_entidadbancaria,

    ]);

    if (result.rowCount === 0) {
      return { error: 'no existe comision en esta operacion' }; // Devuelve un objeto con el mensaje de error
    }

  } catch (error) {
    throw new Error('Error al seleccionar la operación: ' + error.message);
  }
}

export default {
  addOperaciones,
  getAllOperaciones,
  updateOperacionesById,
  getAllOperacionesFilter,
  deleteOperacionesById,
  ObtenerComisionByBankandTransa
}