
import pool from '../database.js';

// Función para agregar un nueva entidad
async function addEntidadBancaria(entidadBancaria) {
  const banco = await pool.connect();
  try {
    const { entidad, acronimo, estado, sobregiro } = entidadBancaria;
    if (!entidad || !acronimo || !estado || !sobregiro) {
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
    const entidad = await entidadBancaria.query('SELECT * FROM entidadbancaria');
    return entidad.rows;
  } finally {
    entidadBancaria.release();
  }
}

// Función para obtener una entidad bancaria por su ID
export const getEntidadBancariaById = async (req, res) => {
  try {
    const entidadBancariaId = req.params.entidadBancariaId;
    const client = await pool.connect();
    const query = 'SELECT * FROM entidadbancaria WHERE id_entidadbancaria = $1 and estado = true';
    const result = await client.query(query, [entidadBancariaId]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entidad bancaria no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

  //funcion para actualizar la entidad bancaria
export const updateEntidadBancariaById = async (entidadBancariaId, newData) => {
  try {
    const client = await pool.connect();
    // Construir la consulta SQL de actualización
    const query = 'UPDATE entidadbancaria  SET entidad = $2, acronimo = $3, estado = $4, sobregiro = $5 WHERE id_entidadbancaria = $1';
    // Ejecutar la consulta SQL con los nuevos datos y el ID de la entidad bancaria
    await client.query(query, [newData.entidad, newData.acronimo, newData.estado, newData.sobregiro, entidadBancariaId]);
    
    // Liberar la conexión al pool de conexiones
    client.release();
    
    return { message: 'Entidad bancaria actualizada correctamente' };
  } catch (error) {
    throw new Error('Error al actualizar la entidad bancaria: ' + error.message);
  }
};
  //funcion para eliminar la entidad bancaria
  export const deleteEntidadBancariaById = async (entidadBancariaDelete, newData) => {
    try {
      const client = await pool.connect();
      // Construir la consulta SQL de actualización
      const query = 'UPDATE entidadbancaria SET estado = $1 WHERE id_entidadbancaria = $2';
      // Ejecutar la consulta SQL con los nuevos datos y el ID de la entidad bancaria
      await client.query(query, [newData.estado, entidadBancariaDelete]);
      console.log(entidadBancariaDelete)
      // Liberar la conexión al pool de conexiones
      client.release();
      // Ejecutar la consulta SQL con los nuevos datos y el ID de la entidad bancaria
      const result = await client.query(query, [newData.estado, entidadBancariaDelete]);
    
      // Verificar si alguna fila fue afectada
     if (result.rowCount === 0) {
      // Si no se afectó ninguna fila, significa que el ID proporcionado no existe
      result.status(500).json({ error: 'Error al eliminar entidad bancaria' });
     }
      
      return { message: 'Entidad bancaria eliminada correctamente' };
    } catch (error) {
      throw new Error('Error al eliminar la entidad bancaria: ' + error.message);
    }
  };



// Exportar las funciones del modelo
export default { addEntidadBancaria, getAllEntidadesBancarias, getEntidadBancariaById, deleteEntidadBancariaById };
