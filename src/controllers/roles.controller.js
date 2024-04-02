
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


  export const getRolById = async (req, res) => {
    const { id } = req.params;
    try {
      const rol = await Rol.getRolById(id);
      if (!rol) {
        return res.status(404).json({ error: 'Rol not found' });
      }
      res.status(200).json(rol);
    } catch (error) {
      console.error('Error al obtener el rol:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };