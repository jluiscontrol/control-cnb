
import pool from '../database.js'; 
import config from '../config.js';
import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token = req.headers["x-access-token"];
    
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, config.SECRET);

        const user = await pool.connect();
        try {
            // Buscar el usuario en la base de datos usando el ID de usuario almacenado en el token
            const queryText = 'SELECT * FROM usuario WHERE id_usuario = $1';
            const { rows } = await user.query(queryText, [decoded.userId]);

            if (!rows[0]) {
                return res.status(404).json({ message: 'No user found' });
            }

            // Almacenar el usuario en el objeto de solicitud para que pueda ser utilizado por otros controladores
            req.user = rows[0];
            next();
        } finally {
            user.release();
        }
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
}

