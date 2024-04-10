
import pool from '../database.js';
import { consultarClienteAPI } from '../helpers/funciones.js';

        
export async function insertarCliente(cliente) {
    try {
        // Consultar si el cliente ya existe en la base de datos local
        const consultaClienteExistente = await pool.query(`
            SELECT * FROM persona WHERE cedula = $1`, [cliente.cedula]);
  
        // Si el cliente ya existe en la base de datos local, devolver sus datos
        if (consultaClienteExistente.rows.length > 0) {
            return {
              id_persona: consultaClienteExistente.rows[0].id_persona,
              nombre: consultaClienteExistente.rows[0].nombre,
              cedula: consultaClienteExistente.rows[0].cedula
            };
        }
  
        // Si el cliente no existe en la base de datos local, consultarlo en la API
        const datosClienteAPI = await consultarClienteAPI(cliente.cedula);

        // Verificar si la API devolvió la cédula
        if (!datosClienteAPI.data.identity) {
            throw new Error('Cédula incorrecta: verifique e ingrese nuevamente.');
        }
  
        // Insertar el cliente en la tabla persona
        const result = await pool.query(`
            INSERT INTO persona (nombre, cedula)
            VALUES ($1, $2)
            RETURNING id_persona`, [
              datosClienteAPI.data.name,
              datosClienteAPI.data.identity
        ]);
  
        // Devolver los datos del cliente insertado
        return {
          id_persona: result.rows[0].id_persona,
          nombre: datosClienteAPI.data.name,
          cedula: datosClienteAPI.data.identity
        };
    } catch (error) {
        console.error('Error al insertar cliente:', error);
        throw error;
    }
};

  

export default {
  insertarCliente
};