
import pool from '../database.js';

// Función para agregar un nueva entidad
async function addEntidadBancaria(entidadBancaria) {
  const banco = await pool.connect();
  try {
    const { entidad, acronimo, estado = true, sobregiro } = entidadBancaria;
    if (!entidad || !acronimo ||  !sobregiro) {
      throw new Error('Todos los campos son requeridos');
    }
    //verificar si el banco ya existe
    const existingBanco = await banco.query('SELECT * FROM entidadbancaria WHERE entidad = $1', [entidad]);
    if (existingBanco.rows.length > 0) {
        throw new Error('La entidad bancaria ya existe')
    }
    //Si el banco no existe, procedemos a hacer el insert
    const result = await banco.query('INSERT INTO entidadbancaria(entidad, acronimo, estado,  sobregiro) VALUES( $1, $2, $3, $4) RETURNING *', [entidad, acronimo, estado, sobregiro]);
    return result.rows[0];
  } finally { 
    banco.release();
  }
}

// Función para obtener todas las entidades bancarias
async function getAllEntidadesBancarias() {
  const entidadBancaria = await pool.connect();
  try {
    const entidad = await entidadBancaria.query('SELECT * FROM entidadbancaria ORDER BY id_entidadbancaria');
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
    const query = 'SELECT * FROM entidadbancaria WHERE id_entidadbancaria = $1 and estado = true';
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
    const query = 'UPDATE entidadbancaria SET entidad = $1, acronimo = $2, sobregiro = $3 WHERE id_entidadbancaria = $4';
    const result = await client.query(query, [newData.entidad, newData.acronimo,  newData.sobregiro, entidadBancariaId]);

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
export default { addEntidadBancaria, getAllEntidadesBancarias,getAllEntidadesBancariasActivas, getEntidadBancariaById, deleteEntidadBancariaById };
