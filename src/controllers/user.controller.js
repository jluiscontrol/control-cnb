
import User from '../models/User.Model.js';
//import jwt from 'jsonwebtoken';
//import bcrypt from 'bcrypt';
import { getUserId } from '../models/User.Model.js';
import { updateUser } from '../models/User.Model.js';
import { deleteUser } from '../models/User.Model.js';


export const createUser = async (req, res) => {
  const { nombre_usuario, contrasenia, estado, roleId, nombre, apellido, fecha_nacimiento, direccion, telefono, cedula } = req.body;

  // Verificar si algún campo requerido está vacío
 // Verificar si algún campo requerido está vacío
if (!nombre_usuario || !contrasenia || !cedula || !nombre || !apellido ) {
  const camposFaltantes = [];
  if (!nombre_usuario) camposFaltantes.push('Nombre de usuario');
  if (!contrasenia) camposFaltantes.push('Contraseña');
  if (!cedula) camposFaltantes.push('Cédula');
  if (!nombre) camposFaltantes.push('Nombres');
  if (!apellido) camposFaltantes.push('Apellidos');
  
  return res.status(400).json({ error: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}.` });
}

  try {
    // Llama a la función addUser con los parámetros proporcionados
    const userSave = await User.addUser({ nombre_usuario, contrasenia, estado },{ nombre, apellido, fecha_nacimiento, direccion, telefono, cedula }, roleId);

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
      res.status(500).json({ error: 'Error interno del servidor' });
    }
}

//funcion para obtener un usuario en especifico
export const getUserById = async (req, res) => {
    try {
      const usuario = await getUserId(req, res);
      res.status(200).json(usuario)
    } catch (error){
      console.error('Error al obtener el usuario por ID:', error);
      res.status(500).json({ error: 'Error interno del seervidor' });
    }
}
//funcion para actulizar el usuario

export const updateUserById = async (req, res) => {
  const userId = req.params.userId;
  const { nombre_usuario, contrasenia, estado, roleId, nombre, apellido, fecha_nacimiento, direccion, telefono } = req.body;

  try {

    // Crear el objeto persona con los datos formateados
    const persona = { nombre, apellido, fecha_nacimiento: fecha_nacimiento, direccion, telefono };

    // Llamar a updateUser con los datos actualizados, incluyendo los datos de persona
    const updated = await updateUser(userId, { nombre_usuario, contrasenia, estado, roleId, persona });

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const deleteUserById = async (req, res) => {
     const userId = req.params.userId;
     const { estado } = req.body;
     try {
      const updated = await deleteUser(userId, { estado });
        if (!updated) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario actualizado correctamente' });
     } catch (error) {
         console.error('Error al actualizar el usuario:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
      
     }
}