import pool from '../database.js';


export async function addOperaciones(operaciones) {
  const operacion = await pool.connect();
  let client;
  try {
    client = await operacion.query("BEGIN");

    const { id_entidadbancaria, 
            id_tipotransaccion, 
                    id_cliente, 
                         valor, 
                    referencia, 
                    comentario, 
                 numtransaccion } = operaciones;

    // Validar campos obligatorios
    if (!id_entidadbancaria || !id_tipotransaccion || !id_cliente || !valor || !numtransaccion) {
      throw new Error;
    }

    // Validar tipos de datos
         if (typeof id_entidadbancaria !== 'number' 
          || typeof id_tipotransaccion !== 'number' 
          || typeof id_cliente !== 'number' 
          || typeof numtransaccion !== 'number' 
          || typeof valor !== 'number') {
      
      throw new Error;
    }

    // Validar formato de numtransaccion con expresión regular
    const numTransaccionRegex = /^[0-9]+$/; // Solo permite letras y números
    if (!numTransaccionRegex.test(numtransaccion)) {
      throw new Error('El número de transacción debe contener solo letras y números');
    }

      // Insertar operación
    const result = await operacion.query(`
          INSERT INTO 
          operaciones(id_entidadbancaria, 
                      id_tipotransaccion, 
                              id_cliente, 
                                   valor, 
                              referencia, 
                              comentario, 
                           numtransaccion) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`, [id_entidadbancaria, 
                         id_tipotransaccion, 
                                 id_cliente, 
                                      valor, 
                                 referencia, 
                                 comentario, 
                              numtransaccion]);

    await operacion.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (client) await operacion.query("ROLLBACK");
    throw new Error('Error al agregar operación: ' + error.message);
  } finally {
    operacion.release();
  }
}




export default { addOperaciones }