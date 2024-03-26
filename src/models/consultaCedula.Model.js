
import pool from '../database.js';
import { consultarClienteAPI } from '../helpers/funciones.js';


export async function insertarCliente(cliente) {
  try {
      // Consultar si el cliente ya existe en la base de datos local
      const consultaClienteExistente = await pool.query(`
          SELECT id_persona FROM persona WHERE cedula = $1`, [cliente.cedula]);

      // Si el cliente ya existe en la base de datos local, devolver su id_persona
      if (consultaClienteExistente.rows.length > 0) {
          return consultaClienteExistente.rows[0].id_persona;
      }

      // Si el cliente no existe en la base de datos local, consultarlo en la API
      const datosClienteAPI = await consultarClienteAPI(cliente.cedula);
      console.log('consulta api..',datosClienteAPI)

      // Insertar el cliente en la tabla persona
      const result = await pool.query(`
          INSERT INTO persona (nombre, cedula)
          VALUES ($1, $2)
          RETURNING id_persona`, [
          datosClienteAPI.data.identity,
          datosClienteAPI.data.name
      ]);
       
      return result.rows[0].id_persona;
  } catch (error) {
      console.error('Error al insertar cliente:', error);
      throw error;
  }
}

export default {
  insertarCliente
};