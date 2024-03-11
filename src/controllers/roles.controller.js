
import Rol from '../models/Role.Model.js';

//funcion para obtener todos los usuarios
export const getRoles = async (req, res) => {
    try {
      const cajas = await Rol.getAllRolesModel();
      res.status(200).json(cajas);
    } catch (error) {
      console.error('Error al obtener las cajas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };