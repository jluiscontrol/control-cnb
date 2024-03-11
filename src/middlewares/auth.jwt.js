
import pool from '../database.js';
import config from '../config.js';
import jwt from 'jsonwebtoken';
import { isTokenExpired } from '../helpers/funciones.js'

export const verifyToken = async (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        // Verificar si el token ha caducado
        const isExpired = await isTokenExpired(token);
        if (isExpired) {
            return res.status(401).json({ message: 'Token ha caducado' });
        }

        // Si el token no ha caducado, decodificarlo y continuar con la lógica de verificación
        const decoded = jwt.verify(token, config.SECRET);
        const { rows } = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [decoded.userId]);

        if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

        req.user = rows[0]; // Almacena el usuario en el objeto de solicitud
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Verificar si es admin
export const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id_usuario; // Obtiene el ID de usuario desde el objeto de solicitud

        if (!userId) { // Verifica si el ID de usuario está presente en la solicitud
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const query = `SELECT EXISTS (
                        SELECT 1 FROM usuario u
                        JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
                        JOIN rol r ON ur.id_rol = r.id_rol
                        WHERE u.id_usuario = $1 AND r.nombre = 'administrador'
      ) AS is_admin;`; // Consulta SQL para verificar si el usuario tiene el rol de administrador

        const { rows } = await pool.query(query, [userId]); // Ejecuta la consulta con el ID del usuario

        if (rows[0].is_admin) { // Verifica si el usuario es administrador
            return next(); // Si el usuario es administrador, pasa al siguiente middleware
        } else {
            return res.status(403).json({ message: "Se requiere rol de administrador" }); // Si el usuario no es administrador, devuelve un error 403 Forbidden
        }
    } catch (error) {
        console.error("Error al verificar el rol de administrador:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


//Verificar si es empleado
export const verifyEmpleado = async (req, res, next) => {
    try {
        const userId = req.user?.id_usuario; // Obtiene el ID de usuario desde el objeto de solicitud

        if (!userId) { // Verifica si el ID de usuario está presente en la solicitud
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        const query = `SELECT EXISTS (
        SELECT 1 FROM usuario u
        JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
        JOIN rol r ON ur.id_rol = r.id_rol
        WHERE u.id_usuario = $1 AND r.nombre = 'empleado'
      ) AS is_admin;`; // Consulta SQL para verificar si el usuario tiene el rol de administrador

        const { rows } = await pool.query(query, [userId]); // Ejecuta la consulta con el ID del usuario

        if (rows[0].is_admin) { // Verifica si el usuario es administrador
            return next(); // Si el usuario es administrador, pasa al siguiente middleware
        } else {
            return res.status(403).json({ message: "Se requiere rol de empleado" }); // Si el usuario no es administrador, devuelve un error 403 Forbidden
        }
    } catch (error) {
        console.error("Error al verificar el rol de empleado:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default { verifyToken, verifyAdmin, verifyEmpleado }

