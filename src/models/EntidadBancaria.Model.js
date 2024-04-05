
import pool from '../database.js';

// Función para agregar una nueva entidad bancaria
async function addEntidadBancaria(entidadBancaria) {
  const cliente = await pool.connect();
  try {
    const { entidad, acronimo, estado = true, comision, sobregiro, saldocuenta = 0, saldocaja = 0 } = entidadBancaria;
    if (!entidad || !acronimo || !sobregiro || !comision) {
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
    const result = await cliente.query('INSERT INTO entidadbancaria(entidad, acronimo, estado, sobregiro, comision) VALUES ($1, $2, $3, $4, $5) RETURNING id_entidadbancaria', [entidad, acronimo, estado, sobregiro, comision]);
    const id_entidadbancaria = result.rows[0].id_entidadbancaria;

    // Insertar el saldo de cuenta y el saldo de caja en una sola operación
    await cliente.query('INSERT INTO saldos(entidadbancaria_id, saldocuenta, saldocaja) VALUES ($1, $2, $3)', [id_entidadbancaria, saldocuenta, saldocaja]);

    // Confirmar la transacción
    await cliente.query('COMMIT');

    return { id_entidadbancaria, entidad, acronimo, comision, estado, sobregiro, saldocuenta, saldocaja };
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
export const getEntidadBancariaById = async (entidadBancariaId ) => {
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
    const query = 'UPDATE entidadbancaria SET entidad = $1, acronimo = $2, sobregiro = $3, comision = $4 WHERE id_entidadbancaria = $5';
    const result = await client.query(query, [newData.entidad, newData.acronimo,  newData.sobregiro, newData.comision ,entidadBancariaId]);

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
  try {
    const client = await pool.connect();
    const query = 'UPDATE entidadbancaria SET estado = $1  WHERE id_entidadbancaria = $2';
    const result = await client.query(query, [newData.estado, entidadBancariaId]);
    if (result.rowCount === 0) {
      return { error: 'La entidad bancaria con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }
    client.release();
   if(newData.estado == true){
     return { message: 'Entidad bancaria activada correctamente' };
   }else{
    return { message: 'Entidad bancaria inactivada correctamente' };

   }
  } catch (error) {
    throw new Error('Error al inactivar la entidad bancaria: ' + error.message);
  }
};



// Exportar las funciones del modelo
export default { addEntidadBancaria, 
           getAllEntidadesBancarias,
    getAllEntidadesBancariasActivas, 
             getEntidadBancariaById, 
          deleteEntidadBancariaById };
