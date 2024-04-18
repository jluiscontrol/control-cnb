
import pool from '../database.js';

// Función para agregar una nueva entidad bancaria
async function addEntidadBancaria(entidadBancaria) {
  const cliente = await pool.connect();
  try {
    const { entidad, acronimo, estado = true, comision, sobregiro, por_cada } = entidadBancaria;
    if (!entidad || !acronimo || !sobregiro || !comision || !por_cada) {
      throw new Error('Todos los campos son requeridos');
    }
    // Iniciar una transacción
    await cliente.query('BEGIN');
    // Verificar si la entidad bancaria ya existe
    const existingBanco = await cliente.query('SELECT * FROM entidadbancaria WHERE entidad = $1', [entidad]);
    if (existingBanco.rows.length > 0) {
      throw new Error('La entidad bancaria ya existe');
    }
    // Insertar la nueva entidad bancaria
    let comisionFormateada = parseFloat(comision).toFixed(2);
    let por_cadaFormateada = parseFloat(por_cada).toFixed(2);
    const result = await cliente.query('INSERT INTO entidadbancaria(entidad, acronimo, estado, sobregiro, comision, por_cada) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_entidadbancaria', [entidad, acronimo, estado, sobregiro, comisionFormateada, por_cadaFormateada]);
    const id_entidadbancaria = result.rows[0].id_entidadbancaria;
    // Confirmar la transacción
    await cliente.query('COMMIT');
    return { id_entidadbancaria, entidad, acronimo, comision, estado, sobregiro };
  } catch (error) {
    // Si hay algún error, hacer rollback de la transacción
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    // Siempre liberar el cliente
    cliente.release();
  }
}



// Función para obtener todas las entidades bancarias
async function getAllEntidadesBancarias() {
  const entidadBancaria = await pool.connect();
  try {
    const query = `
      SELECT e.*
      FROM entidadbancaria e
      ORDER BY e.id_entidadbancaria;
    `;
    const entidad = await entidadBancaria.query(query);
    return entidad.rows;
  } finally {
    entidadBancaria.release();
  }
}

// Función para obtener todas las entidades bancarias activas
async function getAllEntidadesBancariasActivas() {
  const entidadBancaria = await pool.connect();
  try {
    const entidad = await entidadBancaria.query('SELECT * FROM entidadbancaria WHERE estado = true');
    return entidad.rows;
  } finally {
    entidadBancaria.release();
  }
}

// Función para obtener una entidad bancaria por su ID
export const getEntidadBancariaById = async (entidadBancariaId) => {
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM entidadbancaria WHERE id_entidadbancaria = $1';
    const result = await client.query(query, [entidadBancariaId]);
    client.release();
    if (result.rows.length === 0) {
      return { error: 'Entidad bancaria no encontrada' }; // Devuelve un objeto con el mensaje de error
    }
    return result.rows[0]; // Devuelve la entidad bancaria encontrada
  } catch (error) {
    console.error('Error al obtener la entidad bancaria por ID:', error);
    throw error; // Relanza el error para que sea manejado por el controlador
  }
}


// Función para actualizar la entidad bancaria por su ID
export const updateEntidadBancariaById = async (entidadBancariaId, newData) => {
  try {
    const client = await pool.connect();
    const query = 'UPDATE entidadbancaria SET entidad = $1, acronimo = $2, sobregiro = $3, comision = $4, por_cada = $5 WHERE id_entidadbancaria = $6';

    // Asegurarse de que comision tiene formato de dinero
    newData.comision = parseFloat(newData.comision).toFixed(2);

    newData.comision = parseFloat(newData.comision).toFixed(2);
    newData.por_cada = parseFloat(newData.por_cada).toFixed(2);

    const result = await client.query(query, [
      newData.entidad,
      newData.acronimo,
      newData.sobregiro,
      newData.comision,
      newData.por_cada,
      entidadBancariaId]);

    if (result.rowCount === 0) {
      return { error: 'La entidad bancaria con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }

    client.release();
    return { message: 'Entidad bancaria actualizada correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar la entidad bancaria: ' + error.message);
  }
};

// Función para actualizar la entidad bancaria por su ID
export const deleteEntidadBancariaById = async (entidadBancariaId, newData) => {
  const client = await pool.connect();
  try {
    const query = 'UPDATE entidadbancaria SET estado = $1  WHERE id_entidadbancaria = $2';
    const result = await client.query(query, [newData.estado, entidadBancariaId]);
    if (result.rowCount === 0) {
      return { error: 'La entidad bancaria con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }
    if (newData.estado == true) {
      return { message: 'Entidad bancaria activada correctamente' };
    } else {
      return { message: 'Entidad bancaria inactivada correctamente' };

    }
  } catch (error) {
    throw new Error('Error al inactivar la entidad bancaria: ' + error.message);
  } finally {
    client.release();
  }
};

// Funcion para obtener los saldos por caja
export const saldosByCajaId = async (cajaId, userId, fecha) => {
  const client = await pool.connect();
  try {
    const query = `
    SELECT 
      SUM(CASE 
        WHEN tt.afectacaja_id = 1 THEN o.valor
        WHEN tt.afectacaja_id = 2 THEN -o.valor
        ELSE 0
      END) AS total_valor_caja,
      SUM(CASE 
        WHEN tt.afectacuenta_id = 1 THEN o.valor
        WHEN tt.afectacuenta_id = 2 THEN -o.valor
        ELSE 0
      END) AS total_valor_cuenta,
      SUM(CASE 
        WHEN o.tipodocumento = 'MV' AND tt.afectacomision_id = 1 THEN o.valor
        WHEN o.tipodocumento = 'MV' AND tt.afectacomision_id = 2 THEN -o.valor
        WHEN o.tipodocumento = 'OPR' AND tt.afectacomision_id = 1 THEN o.saldocomision
        WHEN o.tipodocumento = 'OPR' AND tt.afectacomision_id = 2 THEN -o.saldocomision
        ELSE 0
      END) AS total_comisiones
    FROM operaciones o
    JOIN tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
    WHERE 
    o.id_caja = $1 AND 
    o.id_usuario = $2 AND 
    DATE_TRUNC('day', o.fecha_registro) = DATE_TRUNC('day', $3::TIMESTAMP)
    GROUP BY o.id_caja, o.id_usuario, DATE_TRUNC('day', o.fecha_registro)
    `;
    const result = await client.query(query, [cajaId, userId, fecha]);
    console.log(result.rows)
    return result.rows;
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
};

// Funcion para obtener los saldos por caja y entidad
export const saldosByEntidadAndCajaId = async (cajaId, userId, fecha) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        e.id_entidadbancaria,
        e.entidad,
        SUM(CASE WHEN t.afectacaja_id = 1 THEN o.valor WHEN t.afectacaja_id = 2 THEN -o.valor ELSE 0 END) AS total_valor_caja,
        SUM(CASE WHEN t.afectacuenta_id = 1 THEN o.valor WHEN t.afectacuenta_id = 2 THEN -o.valor ELSE 0 END) AS total_valor_cuenta,
        SUM(CASE WHEN o.tipodocumento = 'MV' AND t.afectacomision_id = 1 THEN o.valor WHEN o.tipodocumento = 'MV' AND t.afectacomision_id = 2 THEN -o.valor ELSE 0 END) +
        SUM(CASE WHEN o.tipodocumento = 'OPR' AND t.afectacomision_id = 1 THEN o.saldocomision WHEN o.tipodocumento = 'OPR' AND t.afectacomision_id = 2 THEN -o.saldocomision ELSE 0 END) AS total_comisiones
      FROM 
        operaciones o
      INNER JOIN 
        entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
      INNER JOIN 
        tipotransaccion t ON o.id_tipotransaccion = t.id_tipotransaccion
      WHERE 
        o.id_caja = $1 AND
        o.id_usuario = $2 AND
        DATE_TRUNC('day', o.fecha_registro) = DATE_TRUNC('day', $3::TIMESTAMP)
      GROUP BY 
        e.id_entidadbancaria, e.entidad
    `;
    const result = await client.query(query, [cajaId, userId, fecha]);
    console.log(result.rows)
    return result.rows;
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
  }
};



// Exportar las funciones del modelo
export default {
  addEntidadBancaria,
  getAllEntidadesBancarias,
  getAllEntidadesBancariasActivas,
  getEntidadBancariaById,
  deleteEntidadBancariaById,
  saldosByCajaId,
  saldosByEntidadAndCajaId
};
