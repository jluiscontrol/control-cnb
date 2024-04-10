import jwt from 'jsonwebtoken';
import pool from '../database.js';
import axios from 'axios';

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
export async function existeNumTransaccion(numtransaccion, id_entidadbancaria) {
    const operacion = await pool.connect();
    try {
        const existeTransaccion = await operacion.query('SELECT id_operacion FROM operaciones WHERE numtransaccion = $1 AND id_entidadbancaria = $2', [numtransaccion, id_entidadbancaria]);
        if (existeTransaccion.rows.length > 0) {
            // Si existe una transacción con el número de transacción dado y la entidad bancaria dada, devuelve su id_operacion
            return existeTransaccion.rows[0].id_operacion;
        } else {
            // Si no existe una transacción con el número de transacción dado y la entidad bancaria dada, devuelve null
            return null;
        }
    } finally {
        operacion.release();
    }
}

// En el modelo de entidad bancaria (por ejemplo)
export async function obtenerSobregiroPermitido(id_entidadbancaria) {
    // Realizar la consulta para obtener el límite del sobregiro
    const entidadBancariaQuery = await pool.query(`
      SELECT sobregiro FROM entidadbancaria WHERE id_entidadbancaria = $1`, [id_entidadbancaria]);
    
    // Comprobar si se encontró el límite del sobregiro
    if (entidadBancariaQuery.rows.length === 0) {
      return null; // Si no se encuentra, devolver null
    }
    
    // Devolver el límite del sobregiro
    return entidadBancariaQuery.rows[0].sobregiro;
  }

export async function consultarClienteAPI(nident) {
    try {
        // Realizar la consulta a la API externa utilizando el token
        const response = await axios.post(
            'https://sacc.sistemascontrol.ec/api_control_identificaciones/public/data/consulta-identificacion',
            {
                "func": nident.length === 10 ? "GETCEDULA" : "GETRUC", "ruc": nident
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjMzMjMwMDM5MTc3LCJhdWQiOiJkMTM5MjhlYzAwMDg4Nzg0ZWMyOTA5MWNmMWM4OWJiN2JlMzAwOGE2IiwiZGF0YSI6eyJ1c3VhcmlvSWQiOiIxIiwibm9tYnJlIjoiQ09OVFJPTCJ9fQ.JcCt-17CJa8KZLWK1BzetcgReAksrlHFXoDug0fNaVk',
                    'Accept-X-Control-Y': 'controlsistemasjl.com'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error al consultar  datos del cliente:', error);
        throw error;
    }
}

export async function consultarLicenciaCliente(nident) {
    try {
        // Realizar la consulta a la API externa utilizando el token
        const response = await axios.post(
            'https://sacc.sistemascontrol.ec/api_control_identificaciones/public/licencia-web/search',
            {
                "client_id": nident
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjMzMjMwMDM5MTc3LCJhdWQiOiJkMTM5MjhlYzAwMDg4Nzg0ZWMyOTA5MWNmMWM4OWJiN2JlMzAwOGE2IiwiZGF0YSI6eyJ1c3VhcmlvSWQiOiIxIiwibm9tYnJlIjoiQ09OVFJPTCJ9fQ.JcCt-17CJa8KZLWK1BzetcgReAksrlHFXoDug0fNaVk',
                    'Accept-X-Control-Y': 'controlsistemasjl.com'
                }
            }
        );
            console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error al consultar  datos del cliente:', error);
        throw error;
    }

}


export default { isTokenExpired, existeNumTransaccion, obtenerSobregiroPermitido, consultarClienteAPI }