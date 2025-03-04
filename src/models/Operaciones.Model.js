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
      tipodocumento,
      id_caja,
      codigoMovil
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
    const codigoMovilQuery = await operacion.query(`
    SELECT 1 FROM operaciones WHERE codigomovil = $1
  `, [codigoMovil]);

  if (codigoMovilQuery.rows.length > 0) {
    throw new Error(`Esta operacion ya está registrada.`);
  }

    // Consultar el valor de sobregiro de la entidad bancaria
    const entidadBancariaQuery = await operacion.query(`
      SELECT sobregiro FROM entidadbancaria WHERE id_entidadbancaria = $1`, [id_entidadbancaria]);
    const sobregiro = entidadBancariaQuery.rows[0]?.sobregiro || 0;
    // Consultar el saldo disponible en la tabla de saldos
    const saldoQuery = await operacion.query(`
      SELECT saldocuenta FROM saldos WHERE entidadbancaria_id = $1`, [id_entidadbancaria]);

    const saldoDisponible = saldoQuery.rows[0]?.saldocuenta || 0;
    // Validar que el saldo de la cuenta no exceda el límite del sobregiro
    const saldoTotal = saldoDisponible - valor;

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
                  tipodocumento,
                  id_caja,
                  codigomovil)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
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
      tipodocumento,
      id_caja,
      codigoMovil
    ]);

    await operacion.query("COMMIT");

    return { result: result.rows[0], error: null }; // Devolver el resultado y sin error
  } catch (error) {
    if (client) await operacion.query("ROLLBACK");
    return { result: null, error: error.message }; // Devolver null como resultado y el error
  } finally {
    operacion.release();
  }
}


//Funcion para obtener todas las operaciones
export async function getAllOperacionesUnique(id_caja) {
  try {
    const operaciones = await pool.connect();
    try {
      const resultado = await operaciones.query(`
      SELECT DISTINCT ON (o.id_caja, e.entidad)
      o.id_operacion,
      e.id_entidadbancaria AS id_entidadbancaria,
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
      SUM(o.saldocomision) OVER (PARTITION BY o.id_caja, e.entidad) AS saldocomision_operacion,
      o.tipodocumento AS tipodocumento_operacion,
      o.estado AS estado_operacion,
      ac.nombre AS afectacion_caja,
      au.nombre AS afectacion_cuenta,
      u.nombre_usuario AS nombre_usuario_operacion,
      o.id_caja AS id_caja,
      c.nombre AS nombreCaja,
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
  LEFT JOIN
      caja c ON c.id_caja = o.id_caja 
  WHERE 
      o.estado = true
      AND o.id_caja = $1
      AND s.caja_id = $1 -- Filtrar los saldos por el mismo caja_id
  ORDER BY 
      o.id_caja, e.entidad, o.fecha_registro DESC;
  

      `, [id_caja]);

      return resultado.rows;
    } finally {
      operaciones.release();
    }
  } catch (error) {
    throw error;
  }
}


//Funcion para obtener todas las operaciones
export async function getAllOperaciones(id_caja) {
  try {
    const operaciones = await pool.connect();
    try {
      const resultado = await operaciones.query(`
      SELECT 
    o.id_operacion,
    e.id_entidadbancaria AS id_entidadbancaria,
    e.entidad AS entidad,
    e.acronimo AS acronimo,
    e.sobregiro AS sobregiro,
    e.estado AS estado,
    tt.nombre AS tipotransaccion,
    CASE 
        WHEN tt.afectacaja_id = 1 THEN o.valor
        WHEN tt.afectacaja_id = 2 THEN -o.valor      
        ELSE 0 
    END AS valor_operacion,
    o.referencia AS referencia,
    o.comentario AS comentario_operacion,
    o.numtransaccion AS num_transaccion,
    o.fecha_registro AS fecha_registro_operacion,
    o.fecha_actualizacion AS fecha_actualizacion_operacion,
    CASE 
        WHEN tt.afectacomision_id = 1 THEN o.saldocomision
        WHEN tt.afectacomision_id = 2 THEN -o.saldocomision
        ELSE 0
    END AS saldocomision_operacion,
    o.tipodocumento AS tipodocumento_operacion,
    o.estado AS estado_operacion,
    ac.nombre AS afectacion_caja,
    au.nombre AS afectacion_cuenta,
    u.nombre_usuario AS nombre_usuario_operacion,
    s.saldocuenta AS saldocuenta,
    o.id_caja AS caja_id,
    c.nombre AS nombrecaja,
    c.saldocaja AS saldocaja
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
JOIN 
    tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
LEFT JOIN
    afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
LEFT JOIN
    afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
LEFT JOIN
    usuario u ON o.id_usuario = u.id_usuario
LEFT JOIN
    caja c ON c.id_caja = o.id_caja
LEFT JOIN
    (SELECT 
        entidadbancaria_id,
        SUM(saldocuenta) AS saldocuenta
    FROM 
        saldos
    GROUP BY 
        entidadbancaria_id) s ON s.entidadbancaria_id = e.id_entidadbancaria
WHERE 
    o.estado = true
    AND o.id_caja = $1 
    AND date(o.fecha_registro) = CURRENT_DATE
ORDER BY 
    o.fecha_registro DESC;

      `, [id_caja]);

      return resultado.rows;
    } finally {
      operaciones.release();
    }
  } catch (error) {
    throw error;
  }
}


export async function getTodasLasOperaciones() {
    const operaciones = await pool.connect();
    try {
      const query = `
        SELECT o.*,
          e.entidad AS entidad,
          tt.nombre AS tipotransaccion,
          p.cedula AS cedula_persona,
          p.nombre AS nombre_persona
        FROM
          operaciones o
        LEFT JOIN
          entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
        LEFT JOIN
          tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
        LEFT JOIN
          persona p ON o.id_persona = p.id_persona
        ORDER BY o.id_operacion;
      `;
      const operacion = await operaciones.query(query);
      return operacion.rows;
    } finally {
      operaciones.release();
    }   
}

export async function getOperacionesByEntidadBancariaId(entidadId, id_caja) {
  const client = await pool.connect();
  try {
    const resultado = await client.query(`
    SELECT 
    o.id_operacion,
    o.id_entidadbancaria,
    o.id_tipotransaccion,
    CASE
        WHEN tt.afectacuenta_id = 1 THEN o.valor
        WHEN tt.afectacuenta_id = 2 THEN -o.valor
        ELSE 0
    END AS valor_cuenta,
    o.referencia,
    o.comentario,
    o.numtransaccion,
    o.fecha_registro,
    o.fecha_actualizacion,
    o.estado,
    o.id_usuario,
    CASE 
        WHEN tt.afectacomision_id = 1 THEN o.saldocomision
        WHEN tt.afectacomision_id = 2 THEN -o.saldocomision
        ELSE 0
    END AS saldocomision,
    o.estado,
    o.tipodocumento,
    o.id_persona,
    o.id_caja,
    e.entidad AS entidad,
    MAX(sa.saldocuenta) AS saldocuenta,
    c.saldocaja AS saldocaja,
    u.nombre_usuario,
    tt.nombre AS tipotransaccion,
    (CASE 
        WHEN tt.afectacaja_id = 2 THEN -o.valor 
        ELSE o.valor 
    END + COALESCE(MAX(sa.saldocuenta), 0) + COALESCE(o.saldocomision, 0)) AS valor_total_operacion
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
JOIN 
    tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
JOIN 
    usuario u ON u.id_usuario = o.id_usuario
LEFT JOIN 
    caja c ON c.id_caja = o.id_caja
LEFT JOIN 
    saldos sa ON sa.entidadbancaria_id = e.id_entidadbancaria
WHERE 
    o.id_entidadbancaria = $1
    AND o.id_caja = $2
    AND date(o.fecha_registro) = CURRENT_DATE
    AND o.estado = TRUE
GROUP BY 
    o.id_operacion,
    o.id_entidadbancaria,
    o.id_tipotransaccion,
    o.valor,
    o.referencia,
    o.comentario,
    o.numtransaccion,
    o.fecha_registro,
    o.fecha_actualizacion,
    o.id_usuario,
    o.saldocomision,
    o.estado,
    o.tipodocumento,
    o.id_persona,
    o.id_caja,
    e.entidad,
    u.nombre_usuario,
    tt.nombre,  
    c.saldocaja,
    tt.afectacaja_id,
    tt.afectacuenta_id,
    tt.afectacomision_id
ORDER BY 
    o.fecha_registro;

`, [entidadId, id_caja]);
    
    return resultado.rows;
    
  } catch (error) {
    throw new Error('Error al obtener operaciones por entidad bancaria: ' + error.message);
  } finally{
    client.release();
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


export const totalcomisionesdiaanterior = async (id_caja) => {
  const client = await pool.connect(); // Obtiene una conexión del pool
  try {
    const query = `SELECT 
    SUM(CASE
        WHEN tt.afectacomision_id = 1 THEN o.saldocomision
        WHEN tt.afectacomision_id = 2 THEN -o.saldocomision
        ELSE 0 END) AS total_comision, 
    SUM(CASE
        WHEN tt.afectacaja_id = 1 THEN o.valor
        WHEN tt.afectacaja_id = 2 THEN -o.valor
        ELSE 0 END) AS total_valor
    FROM operaciones o 
    JOIN tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
    WHERE o.id_caja = $1 
    AND DATE(o.fecha_registro) < CURRENT_DATE 
    AND o.estado = true`;
    console.log(query);
    const result = await client.query(query, [id_caja]);
    if (result.rowCount === 0) {
      return { error: 'no existe comision en esta operacion' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener el total de comisiones del día anterior:', error);
    throw error;
  } finally {
    client.release();
  }
}

export const totalcomisionesdiaanteriorporentidad = async (id_entidadbancaria, id_caja) => {
  const client = await pool.connect(); 
  try {
    const query = `SELECT 
    SUM(CASE
      WHEN tt.afectacomision_id = 1 THEN o.saldocomision
      WHEN tt.afectacomision_id = 2 THEN -o.saldocomision
      ELSE 0 END) AS total_comision,
    SUM(CASE
      WHEN tt.afectacuenta_id = 1 THEN o.valor
      WHEN tt.afectacuenta_id = 2 THEN -o.valor
      ELSE 0 END) AS total_valor
    FROM operaciones o 
    JOIN tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
    WHERE o.id_entidadbancaria= $1 
    AND o.id_caja = $2 
    AND DATE(o.fecha_registro) < CURRENT_DATE
    AND o.estado = true`;
    const values = [id_entidadbancaria, id_caja];
    const result = await client.query(query, values);
    client.release(); 
    if (result.rowCount === 0) {
      return { error: 'no existe comision en esta operacion' };
    }
    return result.rows[0];
  } catch (error) {
    client.release(); 
    throw new Error('Error al seleccionar la operación: ' + error.message);
  }
}

export const totalcajadeldia = async (id_caja) => {
  const client = await pool.connect();
  try {
    const query = ` 
      SELECT 
        $1 AS id_caja,
        COALESCE(total_valor, 0) AS total_valor,
        COALESCE(total_comision, 0) AS total_comision
      FROM 
        (
          SELECT 
            SUM(CASE 
              WHEN tt.afectacaja_id = 1 THEN o.valor
              WHEN tt.afectacaja_id = 2 THEN -o.valor
              ELSE 0
            END) AS total_valor,
            SUM(CASE
              WHEN tt.afectacomision_id = 1 THEN o.saldocomision
              WHEN tt.afectacomision_id = 2 THEN -o.saldocomision
              ELSE 0
            END) AS total_comision
          FROM 
            operaciones o
          INNER JOIN 
            tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
          WHERE 
            o.id_caja = $1
        ) AS subquery;`;
    const result = await client.query(query, [id_caja]);
    return result.rows[0];
  }
  catch (error) {
    throw new Error('Error al seleccionar la operación: ' + error.message);
  } finally {
    client.release();
  }
}

export default {
  addOperaciones,
  getAllOperaciones,
  updateOperacionesById,
  getAllOperacionesFilter,
  deleteOperacionesById,
  getOperacionesByEntidadBancariaId,
  getAllOperacionesUnique,
  totalcomisionesdiaanterior,
  totalcomisionesdiaanteriorporentidad,
  totalcajadeldia,
  getTodasLasOperaciones
}