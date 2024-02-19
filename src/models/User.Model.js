
import pool from '../database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';

// Función para agregar un nuevo usuario
async function addUser(User, roleId = null) {
  const user = await pool.connect();
  try {
    const { nombre_usuario, estado, contrasenia } = User;

    // Verificar si el usuario ya existe
    const existingUser = await user.query('SELECT * FROM usuario WHERE nombre_usuario = $1', [nombre_usuario]);
    if (existingUser.rows.length > 0) {
      throw new Error('El nombre de usuario ya está en uso.');
    }

    // Verificar si se proporcionó un roleId y si el rol existe
    if (roleId) {
      const roleExists = await user.query('SELECT id_rol FROM rol WHERE id_rol = $1', [roleId]);
      if (roleExists.rows.length === 0) {
       
        throw new Error('El rol seleccionado no está registrado.');
      }
    } else {
      // Si no se proporcionó un roleId, obtener el primer rol registrado
      const defaultRoleQueryResult = await user.query('SELECT id_rol FROM rol ORDER BY id_rol LIMIT 1');
      roleId = defaultRoleQueryResult.rows[0].id_rol;
    }

    // Encriptar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(contrasenia, 10); // 10 es el número de rondas de encriptación

    // Insertar el nuevo usuario
    const userInsertResult = await user.query('INSERT INTO usuario(nombre_usuario, estado, contrasenia) VALUES($1, $2, $3) RETURNING *', [nombre_usuario, estado, hashedPassword]);
    
    const userId = userInsertResult.rows[0].id_usuario;

    // Insertar la relación entre el usuario y el rol en la tabla usuario_rol
    const userRoleInsertResult = await user.query('INSERT INTO usuario_rol(id_usuario, id_rol) VALUES($1, $2) RETURNING *', [userId, roleId]);

    // Generar token JWT con el ID del usuario
    const token = jwt.sign({ id_usuario: userId }, config.SECRET, {
      expiresIn: 86400 // 24 horas
    });

    // Devolver el usuario y el token
    return { usuario: userInsertResult.rows[0], roleId, token };
  } finally {
    user.release();
  }
}

//Funcion para obtener todos los usuarios
async function getAllUsers() {
  const users = await pool.connect();
  try {
    const resultado = await users.query(`
      SELECT u.*, r.nombre AS rol
      FROM usuario u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN rol r ON ur.id_rol = r.id_rol
    `);
    return resultado.rows;
  } finally {
    users.release()
  }
}

// funcion para obtener un usuario por su ID
export const getUserId = async (req, res) => {
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
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del seervidor' });
  }
}
//funcion para actualizar un usuario
export const updateUser = async (userId, updatedData) => {
  try {
    const usuario = await pool.connect();
    const { nombre_usuario, contrasenia,  estado } = updatedData;

    const query = 'UPDATE usuario SET nombre_usuario = $1, contrasenia = $2, = $3, estado = $4  WHERE id_usuario = $5';
    const result = await usuario.query(query, [nombre_usuario, contrasenia,  estado, userId]);

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
export default { addUser, getAllUsers, getUserId, updateUser };
