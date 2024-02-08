

// Función para obtener todas las entidades bancarias
/*async function getEntidadBancaria() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM entidadbancaria');
    return result.rows;
  } finally {
    client.release();
  }
}*/

// Función para agregar un nueva entidad
async function addEntidadBancaria(entidadBancaria) {
  const client = await pool.connect();
  try {
    const { entidad } = entidadBancaria;
    const result = await client.query('INSERT INTO entidadbancaria(entidad) VALUES( $1 ) RETURNING *', [entidad]);
    return result.rows[0];
  } finally { 
    client.release();
  }
}

// Exportar las funciones del modelo
export default { addEntidadBancaria };
