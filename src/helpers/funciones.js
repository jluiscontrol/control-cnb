import jwt from 'jsonwebtoken';
import pool from '../database.js';

//funcion para validar cuando el token ha expirado
export const isTokenExpired = (token) => {
  return new Promise(async (resolve, reject) => {
      try {
          const decoded = jwt.decode(token);
          if (!decoded || !decoded.exp) {
              // Si no se pudo decodificar el token o no tiene información de expiración, se considera como caducado
              resolve(true);
          } else {
              // Extraer la fecha de expiración del token
              const expirationDate = new Date(decoded.exp * 1000); // El tiempo de expiración está en segundos, así que lo multiplicamos por 1000 para convertirlo a milisegundos
              // Comparar la fecha de expiración con la fecha actual
              const isExpired = expirationDate < new Date();
              resolve(isExpired);
          }
      } catch (error) {
          // Si hay un error al verificar el token, rechaza la promesa
          reject(error);
      }
  });
};

//funcion para validar cuando el numero de transacion de una transferencia esta duplicada
export async function existeNumTransaccion(numtransaccion) {
    const operacion = await pool.connect();
    try {
        const existeTransaccion = await operacion.query('SELECT id_operacion FROM operaciones WHERE numtransaccion = $1', [numtransaccion]);
        if (existeTransaccion.rows.length > 0) {
            // Si existe una transacción con el número de transacción dado, devuelve su id_operacion
            return existeTransaccion.rows[0].id_operacion;
        } else {
            // Si no existe una transacción con el número de transacción dado, devuelve null
            return null;
        }
    } finally {
        operacion.release();
    }
}


export default { isTokenExpired, existeNumTransaccion }