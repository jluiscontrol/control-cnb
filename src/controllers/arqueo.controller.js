import ArqueoModel from '../models/Arqueo.Model.js';
import { getArqueoById as getArqueoByIdModel, updateArqueoById as updateArqueoByIdModel } from '../models/Arqueo.Model.js';
import { getFilterFecha} from '../models/Arqueo.Model.js'; // Importar la función getFilterFecha
import { getDetallesArqueoById } from '../models/Arqueo.Model.js'; // Importar la función getDetallesArqueoById
import { valoresArqueoByEncabezadoId } from '../models/Arqueo.Model.js'; // Importar la función valoresArqueoByEncabezadoId

// Función para crear un arqueo
export const createArqueo = async (req, res) => {
  const { caja_id, usuario_id, comentarios, detalles } = req.body;

  if (!caja_id || !usuario_id || !comentarios || !detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const arqueoSave = await ArqueoModel.addEncabezadoarqueo({ caja_id, usuario_id, comentario: comentarios }, detalles);
    res.status(201).json(arqueoSave);
  } catch (error) {
    console.error('Error al crear el arqueo:', error);
    // Enviar el mensaje de error en la respuesta
    res.status(400).json({ error: error.message });
  }
};


//Funcion para obtener todos los arqueos
export const getArqueo = async (req, res) => {
  try {
    const { desde, hasta, usuario_id, id_caja } = req.query; // Obtener los parámetros de consulta desde, hasta y nombreUsuario
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Se requieren parámetros desde y hasta para filtrar por fecha.' });
    }
    const arqueo = await getFilterFecha(desde, hasta, usuario_id, id_caja); // Utilizar la función getFilterFecha para filtrar los arqueos    
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
  

// Función para editar un arqueo por su ID
export const updateArqueoById = async (req, res) => {
  try {
    const encabezadoarqueoId = req.params.encabezadoarqueoId;
    const newData = req.body;

    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar el arqueo' });
    }

    const existingArqueo = await getArqueoByIdModel(encabezadoarqueoId);
    if (existingArqueo.error) {
      return res.status(404).json({ error: existingArqueo.error });
    }

    const result = await updateArqueoByIdModel(encabezadoarqueoId, newData);


    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json({ message: 'Arqueo actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el arqueo por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Función para obtener los detalles de un arqueo específico
export const getDetallesArqueo = async (req, res) => {
  const { encabezadoarqueoId } = req.params;
  try {
    const detalles = await getDetallesArqueoById(encabezadoarqueoId);
    if (!detalles || detalles.error) {
      return res.status(404).json({ error: 'No se encontraron detalles para el arqueo especificado.' });
    }
    res.status(200).json(detalles);
  } catch (error) {
    console.error('Error al obtener los detalles del arqueo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const getValoresArqueoByEncabezadoId = async (req, res) => {
  const { encabezadoarqueoId } = req.params;
  try {
    const detalles = await valoresArqueoByEncabezadoId(encabezadoarqueoId);
    if (!detalles || detalles.error) {
      return res.status(404).json({ error: 'No se encontraron detalles para el arqueo especificado.' });
    }
    res.status(200).json(detalles);
  } catch (error) {
    console.error('Error al obtener los detalles del arqueo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}