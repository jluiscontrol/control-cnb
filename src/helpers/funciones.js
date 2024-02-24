import jwt from 'jsonwebtoken';

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

export default { isTokenExpired }