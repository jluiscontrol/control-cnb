
import pool from '../database.js';

// Función para agregar un nuevo usuario
async function addUser(User) {
  const user = await pool.connect();
  try {
    const { nombre_usuario, estado, tipo_cuenta, contrasenia } = User;
    
    // Verificar si el usuario ya existe
    const existingUser = await user.query('SELECT * FROM usuario WHERE nombre_usuario = $1', [nombre_usuario]);
    if (existingUser.rows.length > 0) {
      throw new Error('El nombre de usuario ya está en uso.');
    }
    
    // Si el usuario no existe, procedemos a insertarlo
    const result = await user.query('INSERT INTO usuario(nombre_usuario, estado, tipo_cuenta, contrasenia) VALUES($1, $2, $3, $4) RETURNING *', [nombre_usuario, estado, tipo_cuenta, contrasenia]);
    
    return result.rows[0];
  } finally { 
    user.release();
  }
}
//Funcion para obtener todos los usuarios
  async function getAllUsers(){
      const users = await pool.connect();
      try{
        const resultado = await users.query('SELECT * FROM usuario');
        return resultado.rows;

      }finally {
        users.release()
      }
  }
// funcion para obtener un usuario por su ID
export const getUserId = async (req, res) =>{
  try {
    const userId = req.params.userId;
    const usuario = await pool.connect();
    const query = 'SELECT * FROM usuario WHERE id_usuario= $1';
    const result = await usuario.query(query, [userId]);
    usuario.release();
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });      
    }
    res.status(200).json(result.rows[0]);
  }catch(error){
    console.error('Error al obtener el usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del seervidor' });
  }
}

export const updateUser = async (userId, updatedData) => {
  try {
    const usuario = await pool.connect();
    const { nombre_usuario, contrasenia, tipo_cuenta, estado } = updatedData;

    const query = 'UPDATE usuario SET nombre_usuario = $1, contrasenia = $2, tipo_cuenta = $3, estado = $4  WHERE id_usuario = $5';
    const result = await usuario.query(query, [nombre_usuario, contrasenia, tipo_cuenta, estado, userId]);
    
    usuario.release();
    if (result.rowCount === 0) {
      return false; // No se actualizó ningún usuario, probablemente el usuario no existe
    }
    return true; // Éxito en la actualización
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw error;
  }
};





// Exportar las funciones del modelo
export default { addUser, getAllUsers, getUserId, updateUser};
