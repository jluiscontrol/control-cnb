import pool from '../database.js';


export async function addOperaciones(operaciones) {
  const operacion = await pool.connect();
  let client;
  try {
    client = await operacion.query("BEGIN");

    const { id_entidadbancaria, 
            id_tipotransaccion, 
                    id_cliente, 
                         valor, 
                    referencia, 
                    comentario, 
                 numtransaccion } = operaciones;

    // Validar campos obligatorios
    if (!id_entidadbancaria || !id_tipotransaccion || !id_cliente || !valor || !numtransaccion) {
      throw new Error;
    }

    // Validar tipos de datos
         if (typeof id_entidadbancaria !== 'number' 
          || typeof id_tipotransaccion !== 'number' 
          || typeof id_cliente !== 'number' 
          || typeof numtransaccion !== 'number' 
          || typeof valor !== 'number') {
      
      throw new Error;
    }

    // Validar formato de numtransaccion con expresión regular
    const numTransaccionRegex = /^[0-9]+$/; // Solo permite letras y números
    if (!numTransaccionRegex.test(numtransaccion)) {
      throw new Error('El número de transacción debe contener solo letras y números');
    }

      // Insertar operación
    const result = await operacion.query(`
          INSERT INTO 
          operaciones(id_entidadbancaria, 
                      id_tipotransaccion, 
                              id_cliente, 
                                   valor, 
                              referencia, 
                              comentario, 
                           numtransaccion) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`, [id_entidadbancaria, 
                         id_tipotransaccion, 
                                 id_cliente, 
                                      valor, 
                                 referencia, 
                                 comentario, 
                              numtransaccion]);

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
            e.entidad AS entidad,
            tt.nombre AS tipotransaccion,
            c.cedula AS cedula_cliente,
            c.nombres AS nombres_cliente,
            c.telefono AS telefono_cliente,
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
            cliente c ON o.id_cliente = c.id_cliente
        JOIN 
            tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
        LEFT JOIN
            comision co ON e.id_entidadbancaria = co.entidadbancaria_id
        LEFT JOIN
            afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
        LEFT JOIN
            afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
        ORDER BY 
            afectacion_caja,
            afectacion_cuenta;
      `);
      return resultado.rows;
    } finally {
      operaciones.release();
    }
  } catch (error) {
    
    throw error; // Re-lanzar el error para que el llamador también pueda manejarlo
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
          c.cedula AS cedula_cliente,
          c.nombres AS nombres_cliente,
          c.telefono AS telefono_cliente,
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
          cliente c ON o.id_cliente = c.id_cliente
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





export default { addOperaciones,  getAllOperaciones, getAllOperacionesFilter }