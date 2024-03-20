import ArqueoModel from '../models/Arqueo.Model.js';
import { getArqueoById as getArqueoByIdModel } from '../models/Arqueo.Model.js';
import { updateArqueoById as getUpdateArqueoByIdModel } from '../models/Arqueo.Model.js';

//Funcion para crear un arqueo
export const createArqueo = async (req, res) => {
  const { caja_id, usuario_id, comentario } = req.body;
  
  if (!caja_id || !usuario_id || !comentario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const arqueoSave = await ArqueoModel.addEncabezadoarqueo({ caja_id, usuario_id, comentario });
    res.status(201).json(arqueoSave);
  } catch (error) {
    console.error('Error al crear el arqueo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//Funcion para obtener todos los arqueos
export const getArqueo = async (req, res) => {
  try {
    const arqueo = await ArqueoModel.getAllArqueo();
    if (!arqueo) {
      return res.status(404).json({ error: 'El arqueo no fue encontrado' });
    }
    res.status(200).json(arqueo);
  } catch (error) {
    console.error('Error al obtener los arqueos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//Funcion para obtener un arqueo en especifico
export const getArqueoById = async (req, res) => {
    try {
      // Llamar a la función del modelo para obtener la entidad bancaria por su ID
      const arqueo = await getArqueoByIdModel(req.params.encabezadoarqueoId);
      if (arqueo.error) {
        // Si hay un error, devuelve un mensaje de error con estado 404
        return res.status(404).json({ error: arqueo.error });
      }
      // Si se encuentra la entidad bancaria, devuelve la entidad en la respuesta
      res.status(200).json(arqueo);
    } catch (error) {
      // Manejar cualquier error que ocurra durante el proceso
      console.error('Error al obtener el arqueo por ID:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
// Función para editar una entidad bancaria por su ID
  export const updateArqueoById = async (req, res) => {
    try {
      const encabezadoarqueoId = req.params.encabezadoarqueoId;
      const newData = req.body;
      
      if (!newData || Object.keys(newData).length === 0) {
        return res.status(400).json({ error: 'Se requieren datos actualizados para editar el arqueo' });
      }
  
      const existingEntidadBancaria = await getArqueoByIdModel(encabezadoarqueoId);
      if (!existingEntidadBancaria) {
        return res.status(404).json({ error: 'El arqueo con el ID proporcionado no existe' });
      }
      const result = await getUpdateArqueoByIdModel(encabezadoarqueoId, newData);
  
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }
  
      res.status(200).json({ message: 'Arqueo actualizado correctamente' });
    } catch (error) {
      
      console.error('Error al actualizar el arqueo por ID:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };