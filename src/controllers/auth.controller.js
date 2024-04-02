import { signin } from '../models/auth.model.js';
import { isTokenExpired } from '../helpers/funciones.js';

export const signIn = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body;

  try {
    // Verificar si el nombre de usuario y la contraseña están presentes
    if (!nombre_usuario || !contrasenia) {
      return res.status(400).json({ error: 'El nombre de usuario y la contraseña son requeridos.' });
    }

    // Llamar a la función de autenticación para verificar las credenciales
    const { id_usuario, nombre_usuario: nombreUsuario, caja_id, id_rol, token } = await signin(nombre_usuario, contrasenia);

    // Verificar si el token ha caducado
    const isExpired = await isTokenExpired(token);
    if (isExpired) {
      return res.status(401).json({ error: 'Token ha caducado' });
    }

    // Si las credenciales son válidas y el token no ha caducado, devolver el token y los datos del usuario en la respuesta
    res.status(200).json({ id_usuario, nombre_usuario: nombreUsuario, caja_id, id_rol, token });
  } catch (error) {
    // Manejar los errores que puedan ocurrir durante la autenticación
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      return res.status(401).json({ error: error.message });
    } else if (error.message === 'Usuario inactivo') {
      return res.status(403).json({ error: error.message }); // 403 Forbidden para usuarios inactivos
    }
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
