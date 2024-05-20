
import pool from '../database.js';

//agregar una nueva comision
export async function addComision({ valorcomision, entidadbancaria_id, tipotransaccion_id, estado = true }) {
  const comisionDatos = await pool.connect();
  let comision;
  try {
    await comisionDatos.query("BEGIN");

    // Verificar si la comisión ya se ha asignado anteriormente
    const existingComisionAsignadaQuery = `SELECT * FROM comision WHERE entidadbancaria_id = $1 AND tipotransaccion_id = $2`;
    const existingComisionResult = await comisionDatos.query(existingComisionAsignadaQuery, [entidadbancaria_id, tipotransaccion_id]);
    if (existingComisionResult.rows.length > 0) {
      return { exists: true };
    }

    // Insertar comision
    const insertQuery = `INSERT INTO comision(valorcomision, entidadbancaria_id, tipotransaccion_id, estado) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await comisionDatos.query(insertQuery, [JSON.stringify(valorcomision), entidadbancaria_id, tipotransaccion_id, estado]);

    await comisionDatos.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (comision) await comisionDatos.query("ROLLBACK");
    throw error;
  } finally {
    comisionDatos.release();
  }
}
//funcion para traer las comisiones 
export async function getAllComisiones() {
  const comision = await pool.connect();
  try {
    const query = `
    SELECT 
        c.id_comision,
        c.valorcomision,
        c.entidadbancaria_id,
        c.tipotransaccion_id,
        e.entidad AS nombre_entidad,
        t.nombre AS nombre_tipotransaccion,
      
        c.estado
      
    FROM 
        public.comision c
    JOIN 
        public.entidadbancaria e ON c.entidadbancaria_id = e.id_entidadbancaria
    JOIN 
        public.tipotransaccion t ON c.tipotransaccion_id = t.id_tipotransaccion
        ORDER BY c.id_comision;
  `;
    const resultado = await comision.query(query);
    return resultado.rows;
  } finally {
    comision.release();
  }
}
//funcion para traer comisiones activas
export async function getAllComisionesActivas() {
  const comision = await pool.connect();
  try {
    const query = `
    SELECT 
        c.id_comision,
        c.valorcomision,
        c.entidadbancaria_id,
        c.tipotransaccion_id,
        e.entidad AS nombre_entidad,
        t.nombre AS nombre_tipotransaccion,
        c.estado
      
    FROM 
        public.comision c
    JOIN 
        public.entidadbancaria e ON c.entidadbancaria_id = e.id_entidadbancaria
    JOIN 
        public.tipotransaccion t ON c.tipotransaccion_id = t.id_tipotransaccion
    WHERE  c.estado = true
    ORDER BY c.id_comision;
  `;
    const resultado = await comision.query(query);
    return resultado.rows;
  } finally {
    comision.release();
  }
}

//funcion para actualizar una comisi{on}
export async function updateComision({ comisionId, valorcomision, entidadbancaria_id, tipotransaccion_id, estado }) {
  const comisionDatos = await pool.connect();
  let comision;
  try {
    await comisionDatos.query("BEGIN");
   // return console.log('entidad:',entidadbancaria_id)

    // Verificar si la comisión existe
    const existingComisionQuery = `SELECT * FROM comision WHERE id_comision = $1`;
    const existingComisionResult = await comisionDatos.query(existingComisionQuery, [comisionId]);
    if (existingComisionResult.rows.length === 0) {
      throw new Error("Comisión no encontrada.");
    }
    
    // Actualizar comisión
    const updateQuery = `UPDATE comision SET valorcomision = $1, entidadbancaria_id = $2, tipotransaccion_id = $3, estado = $4 WHERE id_comision = $5 RETURNING *`;
    const result = await comisionDatos.query(updateQuery, [JSON.stringify(valorcomision), entidadbancaria_id, tipotransaccion_id, estado, comisionId]);
   
    await comisionDatos.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (comision) await comisionDatos.query("ROLLBACK");
    throw error;
  } finally {
    comisionDatos.release();
  }
}

//funcion para traer comisiones activas
export async function  obtenerValorComisionByEntidadYtipoTransaccion(entidadId, tipoTransaccionId) {
  const comision = await pool.connect();
  try {
    const query = `
    SELECT valorcomision
        FROM public.comision 
        WHERE entidadbancaria_id = $1 AND tipotransaccion_id = $2 and estado = true;
  `;
  const resultado = await comision.query(query, [entidadId, tipoTransaccionId]);
    return resultado.rows;
  } finally {
    comision.release();
  }
}





export default { addComision, 
            getAllComisiones, 
     getAllComisionesActivas, 
             updateComision,
             obtenerValorComisionByEntidadYtipoTransaccion
            }