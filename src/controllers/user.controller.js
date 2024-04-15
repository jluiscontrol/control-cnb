
import User from '../models/User.Model.js';

import { getUserId } from '../models/User.Model.js';
import { updateUser } from '../models/User.Model.js';
import { deleteUser } from '../models/User.Model.js';
import { updateCajaById } from '../models/User.Model.js';


export const createPersona = async (req, res) => {
  const { nombre, direccion, telefono, cedula } = req.body;
  
  // Verificar si algún campo requerido está vacío
  if (!nombre || !cedula) {
    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push('Nombre');
    if (!cedula) camposFaltantes.push('Cédula');

    return res.status(400).json({ error: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}.` });
  }

  try {
    const personaSave = await User.addPersona({ nombre, direccion, telefono, cedula });

    // Verificar si la función addPersona devolvió un error relacionado con la cédula ya registrada
    if (personaSave.error) {
      return res.status(400).json({ error: personaSave.error });
    }

    res.status(201).json(personaSave);
  } catch (error) {
    console.error('Error al crear persona:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const createUser = async (req, res) => {
  const { nombre_usuario, contrasenia, estado, id_rol, nombre, apellido, fecha_nacimiento, direccion, telefono, cedula, caja_id } = req.body;
 // Verificar si algún campo requerido está vacío
if (!nombre_usuario || !contrasenia || !cedula || !nombre || !apellido || !caja_id ) {
  const camposFaltantes = [];
  if (!nombre_usuario) camposFaltantes.push('Nombre de usuario');
  if (!contrasenia) camposFaltantes.push('Contraseña');
  if (!cedula) camposFaltantes.push('Cédula');
  if (!nombre) camposFaltantes.push('Nombres');
  if (!apellido) camposFaltantes.push('Apellidos');
  if (!caja_id) camposFaltantes.push('Caja');
  
  
  return res.status(400).json({ error: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}.` });
}

  try {
    // Llama a la función addUser con los parámetros proporcionados
    const userSave = await User.addUser({ nombre_usuario, contrasenia, estado, caja_id },{ nombre, apellido, fecha_nacimiento, direccion, telefono, cedula }, id_rol);
    // Verificar si la función addUser devolvió un error relacionado con la cédula ya registrada
    if (userSave.error) {
      return res.status(400).json({ error: userSave.error }); // Devolver código de estado 401
    }

    res.status(201).json(userSave);
  } catch (error) {
    // Manejar otros errores
    if (error.message === 'El nombre de usuario ya está en uso.' || error.message === 'El rol seleccionado no está registrado. ') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



//funcion para obtener todos los usuarios
export const getUsers = async (req, res) => {
    try{
       const users = await User.getAllUsers();

       res.status(200).json(users)
    } catch(error){
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidors' });
    }
}

export const getEmpleados = async (req, res) => {
  try{
     const empleados = await User.getAllEmpleados();

     res.status(200).json(empleados)
  } catch(error){
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidors' });
  }
}


//funcion para obtener un usuario en especifico
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId; // Obtén el userId de req.params
    const usuario = await getUserId(userId); // Pasa el userId a getUserId
    res.status(200).json(usuario);
  } catch (error){
    console.error('Error al obtener el usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//funcion para actulizar el usuario
export const updateUserById = async (req, res) => {
  const userId = req.params.userId;
  const { nombre_usuario, contrasenia, estado, id_rol, nombre, apellido, fecha_nacimiento, direccion, telefono, cedula, caja_id } = req.body;
  
  try {
    // Crear el objeto persona con los datos formateados
    const persona = { nombre, apellido, fecha_nacimiento, direccion, telefono, cedula };
    // Llamar a updateUser con los datos actualizados, incluyendo el id_rol y los datos de persona
    const updated = await updateUser(userId, { nombre_usuario, contrasenia, estado, id_rol, persona, caja_id });

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


//funcion para crear caja
export const createCaja = async (req, res) => {
  const { nombre, estado } = req.body;

  if (!nombre ) {
    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push('Nombre de caja');
  

    return res.status(400).json({ error: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}.` });
  }

  try {
    // Llama a la función addCaja con los parámetros proporcionados
    const resultSave = await User.addCaja({ nombre, estado });

    // Verificar si la caja ya existe
    if (resultSave && resultSave.exists) {
      return res.status(400).json({ error: 'Esta caja ya se encuentra registrada.' });
    }

    res.status(201).json(resultSave);
  } catch (error) {
    console.error('Error al crear caja:', error);

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


//funcion para obtener todos los usuarios
export const getCajas = async (req, res) => {
  try {
    const cajas = await User.getAllCajas();
    res.status(200).json(cajas);
  } catch (error) {
    console.error('Error al obtener las cajas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//funcion para obtener todos los usuarios
export const getCajasActivas = async (req, res) => {
  try {
    const cajas = await User.getAllCajasActivas();
    res.status(200).json(cajas);
  } catch (error) {
    console.error('Error al obtener las cajas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//funcion para actulizar el usuario

export const updateCaja = async (req, res) => {
  try {
    const cajaId = req.params.cajaId;
    const newData = req.body;
    
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar la caja' });
    }

    const existingCaja = await updateCajaById(cajaId, newData); // Pasa newData a la función updateCajaById
    if (existingCaja.error) {
      return res.status(404).json({ error: existingCaja.error });
    }
  
    res.status(200).json({ message: 'Caja actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la caja por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const deleteUserById = async (req, res) => {
  try {
    const userDeleteId = req.params.userDeleteId;
    const newData = req.body;

    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar el usuario' });
    }

    const result = await deleteUser(userDeleteId, newData);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    if(newData.estado == true){
      return res.status(200).json({ message: 'Usuario activado correctamente' });
    } else {
      return res.status(200).json({ message: 'Usuario desactivado correctamente' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


export const getSaldoActual = async (req, res) => {
  try {
    const id = req.params.cajaId;
    const saldo = await User.getSaldoActualCaja(id);
    res.status(200).json(saldo);
  } catch (error) {
    console.error('Error al obtener el saldo actual de la caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

