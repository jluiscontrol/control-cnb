
import pool from '../database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';


// Función para agregar una nueva persona
async function addPersona(Persona) {
  const persona = await pool.connect();
  try {
    const { nombre, direccion, telefono, cedula } = Persona;

    // Verificar si la cédula ya está registrada
    const existingCedulaQuery = `
      SELECT *
      FROM persona
      WHERE cedula = $1
    `;
    const existingCedulaResult = await persona.query(existingCedulaQuery, [cedula]);

    if (existingCedulaResult.rows.length > 0) {
      return { error: 'Cédula ya registrada, la cedula ya pertenece a una persona registrada.' };
    }

    // Iniciar una transacción
    await persona.query('BEGIN');

    const personaInsertResult = await persona.query(`
      INSERT INTO persona
        (nombre, direccion, telefono, cedula)
      VALUES ($1, $2, $3, $4)
      RETURNING id_persona`,
      [nombre, direccion, telefono, cedula]);

    // Commit la transacción
    await persona.query('COMMIT');

    // Devolver el id_persona de la persona insertada
    return { id_persona: personaInsertResult.rows[0].id_persona };
  } finally {
    persona.release();
  }
}

// Función para agregar un nuevo usuario
async function addUser(User, Persona, id_rol) {
  const user = await pool.connect();
  try {
    const { nombre_usuario, estado, contrasenia, caja_id } = User;
    const { nombre, apellido, fecha_nacimiento, direccion, telefono, cedula } = Persona;

    // Verificar si el nombre de usuario ya está en uso
    const existingUsernameQuery = `
      SELECT *
      FROM usuario
      WHERE nombre_usuario = $1
    `;
    const existingUsernameResult = await user.query(existingUsernameQuery, [nombre_usuario]);
    if (existingUsernameResult.rows.length > 0) {
      return { error: 'El nombre de usuario ya está en uso.' };
    }

    // Verificar si la cédula ya está registrada
    const existingCedulaQuery = `
      SELECT u.*
      FROM usuario u
      LEFT JOIN persona p ON u.persona_id = p.id_persona
      WHERE p.cedula = $1 AND (u.estado = true OR u.estado IS NULL)
    `;
    const existingCedulaResult = await user.query(existingCedulaQuery, [cedula]);

    if (existingCedulaResult.rows.length > 0) {
      return { error: 'Cédula ya registrada, la cedula ya pertenece a un usuario registrado.' };
    }

    // Verificar si se proporcionó un id_rol y si el rol existe
    if (id_rol) {
      const roleExists = await user.query('SELECT id_rol FROM rol WHERE id_rol = $1', [id_rol]);
      if (roleExists.rows.length === 0) {
        throw new Error('El rol seleccionado no está registrado.');
      }
    } else {
      // Si no se proporcionó un id_rol, obtener el primer rol registrado
      const defaultRoleQueryResult = await user.query('SELECT id_rol FROM rol ORDER BY id_rol LIMIT 1');
      id_rol = defaultRoleQueryResult.rows[0].id_rol;
    }

    // Encriptar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(contrasenia, 10); // 10 es el número de rondas de encriptación

    // Iniciar una transacción
    await user.query('BEGIN');

    // Insertar datos personales
    const personaInsertResult = await user.query(`
            INSERT INTO  persona
                  (nombre, 
                  apellido, 
                  fecha_nacimiento, 
                  direccion, 
                  telefono, 
                  cedula) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_persona`,
      [nombre, apellido, fecha_nacimiento, direccion, telefono, cedula]);
    const personaId = personaInsertResult.rows[0].id_persona;

    // Insertar el nuevo usuario
    const userInsertResult = await user.query(`
          INSERT INTO  usuario
                (nombre_usuario, 
                         estado, 
                    contrasenia, 
                    persona_id,
                    caja_id
                       ) 
            VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [nombre_usuario, estado, hashedPassword, personaId, caja_id]);
    const userId = userInsertResult.rows[0].id_usuario;

    // Commit la transacción
    await user.query('COMMIT');

    // Insertar la relación entre el usuario y el rol en la tabla usuario_rol
    const userRoleInsertResult = await user.query('INSERT INTO usuario_rol(id_usuario, id_rol) VALUES($1, $2) RETURNING *', [userId, id_rol]);

    // Generar token JWT con el ID del usuario
    const token = jwt.sign({ id_usuario: userId }, config.SECRET, {
      expiresIn: 43200 // 12 horas
    });

    // Devolver el usuario, el id_rol y el token
    return { usuario: userInsertResult.rows[0], id_rol, token };
  } finally {
    user.release();
  }
}


//Funcion para obtener todos los usuarios
async function getAllUsers() {
  const users = await pool.connect();
  try {
    const resultado = await users.query(`
    SELECT 
      u.*, 
      r.nombre AS rol, 
      r.id_rol AS rol_id,
      p.nombre AS nombre_persona, 
      p.apellido AS apellido_persona, 
      p.fecha_nacimiento AS fecha_nacimiento_persona, 
      p.direccion AS direccion_persona, 
      p.telefono AS telefono_persona,
      p.cedula AS cedula_persona,
      c.nombre AS nombre_caja
    FROM 
    usuario u
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
    LEFT JOIN rol r ON ur.id_rol = r.id_rol
    LEFT JOIN persona p ON u.persona_id = p.id_persona
    LEFT JOIN caja c ON u.caja_id = c.id_caja
    ORDER BY u.id_usuario; 
    `);
    return resultado.rows;
  } finally {
    users.release()
  }
}

async function getAllEmpleados() {
  const empleados = await pool.connect();
  try {
    const resultado = await empleados.query(`
    SELECT 
    u.*, 
    r.nombre AS rol, 
    r.id_rol AS rol_id,
    p.nombre AS nombre_persona, 
    p.apellido AS apellido_persona, 
    p.fecha_nacimiento AS fecha_nacimiento_persona, 
    p.direccion AS direccion_persona, 
    p.telefono AS telefono_persona,
    p.cedula AS cedula_persona
    FROM 
    usuario u
    LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
    LEFT JOIN rol r ON ur.id_rol = r.id_rol
    LEFT JOIN persona p ON u.persona_id = p.id_persona
    WHERE  r.nombre IN ('empleado', 'administrador') 
    ORDER BY u.id_usuario; 
    `);
    return resultado.rows;
  } finally {
    empleados.release()
  }
}

// funcion para obtener un usuario por su ID
export const getUserId = async (userId) => {
  try {
    const usuario = await pool.connect();
    const query = `
      SELECT 
        u.*, 
        r.nombre AS rol,
        r.id_rol AS rol_id,
        p.nombre AS nombre_persona,
        p.apellido AS apellido_persona,
        p.fecha_nacimiento AS fecha_nacimiento_persona,
        p.direccion AS direccion_persona,
        p.telefono AS telefono_persona
      FROM 
        usuario u
        LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
        LEFT JOIN rol r ON ur.id_rol = r.id_rol
        LEFT JOIN persona p ON u.persona_id = p.id_persona
      WHERE 
        u.id_usuario = $1;
    `;
    const result = await usuario.query(query, [userId]);
    usuario.release();
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    return result.rows[0]; // Devuelve solo los datos del usuario, no el objeto de conexión completo
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    throw error;
  }
}

//funcion para actualizar un usuario
export const updateUser = async (userId, updatedData) => {
  const { nombre_usuario, contrasenia, estado, id_rol, persona, caja_id } = updatedData;
  const usuario = await pool.connect();

  try {
    // Iniciar una transacción
    await usuario.query('BEGIN');

    // Obtener la contraseña actual del usuario
    const { rows } = await usuario.query('SELECT contrasenia FROM usuario WHERE id_usuario = $1', [userId]);
    const { contrasenia: currentPassword } = rows[0] || {}; // Obtener la contraseña actual o establecerla como nula si no hay resultados

    // Encriptar la nueva contraseña si se proporciona y no está vacía
    let hashedPassword = currentPassword; // Por defecto, mantener la contraseña actual
    if (contrasenia && contrasenia.trim() !== "") {
      hashedPassword = await bcrypt.hash(contrasenia, 10);
    }

    // Actualizar datos de usuario si se proporcionan
    if (nombre_usuario || contrasenia || estado) {
      const userQuery = 'UPDATE usuario SET nombre_usuario = $1, contrasenia = $2, estado = $3, caja_id = $4 WHERE id_usuario = $5';
      await usuario.query(userQuery, [nombre_usuario, hashedPassword, estado, caja_id, userId]);
    }

    // Actualizar rol del usuario si se proporciona id_rol
    if (id_rol) {
      const userRoleQuery = 'UPDATE usuario_rol SET id_rol = $1 WHERE id_usuario = $2';
      console.log(userRoleQuery)
      await usuario.query(userRoleQuery, [id_rol, userId]);
    }

    // Actualizar datos de persona si se proporcionan
    if (persona) {
      const { nombre, apellido, fecha_nacimiento, direccion, telefono, cedula } = persona;
      const personaQuery = 'UPDATE persona SET nombre = $1, apellido = $2, fecha_nacimiento = $3, direccion = $4, telefono = $5, cedula= $6  WHERE id_persona = (SELECT persona_id FROM usuario WHERE id_usuario = $7)';
      await usuario.query(personaQuery, [nombre, apellido, fecha_nacimiento, direccion, telefono, cedula, userId]);
    }

    // Commit la transacción
    await usuario.query('COMMIT');

    return true; // Éxito en la actualización
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);

    // Rollback en caso de error
    await usuario.query('ROLLBACK');
    throw error;
  } finally {
    usuario.release();
  }
};


//agregar una nueva caja
export async function addCaja(info) {
  const cajaDatos = await pool.connect();
  let box;
  try {
    await cajaDatos.query("BEGIN");

    const { nombre, estado } = info;

    // Verificar si el nombre de usuario ya está en uso
    const existingUsernameQuery = `SELECT * FROM caja WHERE nombre = $1`;
    const existingUsernameResult = await cajaDatos.query(existingUsernameQuery, [nombre]);
    if (existingUsernameResult.rows.length > 0) {
      return { exists: true };
    }

    // Insertar caja
    const result = await cajaDatos.query(`INSERT INTO caja(nombre, estado) VALUES ($1, $2) RETURNING *`, [nombre, estado]);

    await cajaDatos.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    if (box) await cajaDatos.query("ROLLBACK");
    throw error; // Se lanza el error sin modificar
  } finally {
    cajaDatos.release();
  }
}

//Obtener todas las cajas / activas e inactivas
export async function getAllCajas() {
  const cajas = await pool.connect();
  try {
    const query = `SELECT * FROM caja ORDER BY id_caja`;
    const resultado = await cajas.query(query);
    return resultado.rows;
  } finally {
    cajas.release();
  }
}

//obtener cajas solo estado activas
export async function getAllCajasActivas() {
  const cajas = await pool.connect();
  try {
    const query = `SELECT * FROM caja where estado = true`;
    const resultado = await cajas.query(query);
    return resultado.rows;
  } finally {
    cajas.release();
  }
}

export const updateCajaById = async (cajaId, newData) => {
  try {
    const caja = await pool.connect();
    const query = 'UPDATE caja SET nombre = $1, estado = $2 WHERE id_caja = $3';
    const result = await caja.query(query, [newData.nombre, newData.estado, cajaId]);

    if (result.rowCount === 0) {
      return { error: 'La caja con el ID proporcionado no existe' };
    }

    caja.release();
    return { message: 'Caja actualizada correctamente' };
  } catch (error) {
    // Manejo de errores de consulta SQL

    // Manejo de errores de conexión
    throw new Error('Error al actualizar caja: ' + error.message);
  }
};


//FUNCION PARA ELIMINAR USUARIO
export const deleteUser = async (userDeleteId, newData) => {
  // console.log('resultado modelo', newData)
  try {
    const client = await pool.connect();
    const query = 'UPDATE usuario SET estado = $1  WHERE id_usuario = $2';
    const result = await client.query(query, [newData.estado, userDeleteId]);
    if (result.rowCount === 0) {
      return { error: 'El usuario con el ID proporcionado no existe' }; // Devuelve un objeto con el mensaje de error
    }
    client.release();
    if (newData.estado == true) {
      return { message: 'Usuario activado correctamente' };
    } else {
      return { message: 'Usuario desactivado correctamente' };

    }
  } catch (error) {
    throw new Error('Error al desactivar el usuario: ' + error.message);
  }

};

export const getSaldoActualCaja = async (cajaId) => {
  try {
    const caja = await pool.connect();
    const query = `SELECT * FROM caja WHERE id_caja = $1`;
    const result = await caja.query(query, [cajaId]);
    caja.release();
    if (result.rows.length === 0) {
      return { error: 'Caja no encontrada' };
    }
    return result.rows[0]; // Devuelve toda la información de la caja
  } catch (error) {
    throw new Error('Error al obtener el saldo de la caja: ' + error.message);
  }
};

// Exportar las funciones del modelo
export default {
  addUser,
  getAllUsers,
  getUserId,
  updateUser,
  deleteUser,
  addCaja,
  getAllCajas,
  getAllCajasActivas,
  updateCajaById,
  addPersona,
  getAllEmpleados,
  getSaldoActualCaja
};
