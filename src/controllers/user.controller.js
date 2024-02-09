
import User from '../models/User.js';

export const createUser = async (req, res) => {
   
  const { nombre_usuario, estado, tipo_cuenta, contrasenia } = req.body;

  try {
    const userSave = await User.adduser({ nombre_usuario, estado, tipo_cuenta, contrasenia });
    res.status(201).json(userSave);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getUsers = (req, res) => {
    res.json('get usuario')
}

export const getUser = (req, res) => {
    
}
export const getUserById = (req, res) => {
    
}
export const updateUserById = (req, res) => {
    
}
export const deleteUserById = (req, res) => {
    
}