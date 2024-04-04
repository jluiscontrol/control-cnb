import pool from '../database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { isTokenExpired } from '../helpers/funciones.js';

export const signin = async (username, password) => {
    const user = await pool.connect();
    try {
        // Obtener el usuario de la base de datos basado en el nombre de usuario proporcionado
        const userResult = await user.query(`
        SELECT u.*, ur.id_rol 
        FROM usuario u
        LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
        WHERE u.nombre_usuario = $1`, 
        [username]
    );        const userData = userResult.rows[0];

        // Verificar si se encontró un usuario con el nombre de usuario proporcionado
        if (!userData) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar si el estado del usuario es true (activo)
        if (!userData.estado) {
            throw new Error('Usuario inactivo');
        }

        // Verificar si la contraseña proporcionada coincide con la contraseña almacenada en la base de datos
        const passwordMatch = await bcrypt.compare(password, userData.contrasenia);
        if (!passwordMatch) {
            throw new Error('Contraseña incorrecta');
        }
        
        // Generar token JWT con la información del usuario, incluyendo el ID de usuario
        const token = jwt.sign({ userId: userData.id_usuario, nombre_usuario: userData.nombre_usuario, rol_usuario: userData.id_rol ,caja_id: userData.caja_id }, config.SECRET, {
            expiresIn: 86400 // 24 horas
        });

        // Verificar si el token ha caducado
        const isExpired = await isTokenExpired(token);
        if (isExpired) {
            throw new Error('Token ha caducado');
        }
        
        // Devolver el id_usuario, nombre_usuario y el token en un objeto
        return { id_usuario: userData.id_usuario, nombre_usuario: userData.nombre_usuario, caja_id: userData.caja_id, id_rol: userData.id_rol, token};
    } finally {
        user.release();
    }
};

export default { signin };
