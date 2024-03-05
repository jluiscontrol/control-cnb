
import EntidadBancaria from '../models/EntidadBancaria.Model.js';
import { getEntidadBancariaById as getEntidadBancariaByIdModel } from '../models/EntidadBancaria.Model.js'; 
import { updateEntidadBancariaById as updateEntidadBancariaByIdModel } from '../models/EntidadBancaria.Model.js'; 
import { deleteEntidadBancariaById as estadoEntidadBancariaByIdModel } from '../models/EntidadBancaria.Model.js'; 

//Funcion para crear una entidad bancaria
export const createEntidadBancaria = async (req, res) => {

  const { entidad, acronimo, sobregiro } = req.body;
  
  if (!entidad || !acronimo  || !sobregiro ) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const entidadBancariaSave = await EntidadBancaria.addEntidadBancaria({ entidad, acronimo, sobregiro });
    res.status(201).json(entidadBancariaSave);
  } catch (error) {
    if (error.message === 'La entidad bancaria ya existe') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear entidad bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//Funcion para obtener todas las entidades Bancarias
export const getEntidadBancarias = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const entidadesBancarias = await EntidadBancaria.getAllEntidadesBancarias();
    console.log(entidadesBancarias)
    if (!entidadesBancarias) {
      return res.status(404).json({ error: 'Entidad bancaria no encontrada' });
    }
    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(entidadesBancarias);
  } catch (error) {
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//funcion para obtener las entidades bancarias activas
export const getEntidadBancariasActivas = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const entidadesBancarias = await EntidadBancaria.getAllEntidadesBancariasActivas();
    if (!entidadesBancarias) {
      return res.status(404).json({ error: 'Entidad bancaria no encontrada' });
    }
    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(entidadesBancarias);
  } catch (error) {
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//Funcion para obtener una entidad bancaria en especifico
export const getEntidadBancariaById = async (req, res) => {
  try {
    // Llamar a la función del modelo para obtener la entidad bancaria por su ID
    const entidadBancaria = await getEntidadBancariaByIdModel(req.params.entidadBancariaId);
    if (entidadBancaria.error) {
      // Si hay un error, devuelve un mensaje de error con estado 404
      return res.status(404).json({ error: entidadBancaria.error });
    }
    // Si se encuentra la entidad bancaria, devuelve la entidad en la respuesta
    res.status(200).json(entidadBancaria);
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al obtener la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para editar una entidad bancaria por su ID
export const updateEntidadBancariaById = async (req, res) => {
  try {
    const entidadBancariaId = req.params.entidadBancariaId;
    const newData = req.body;
    
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar la entidad bancaria' });
    }

    const existingEntidadBancaria = await getEntidadBancariaByIdModel(entidadBancariaId);
    if (!existingEntidadBancaria) {
      return res.status(404).json({ error: 'La entidad bancaria con el ID proporcionado no existe' });
    }
    console.log(existingEntidadBancaria)
    const result = await updateEntidadBancariaByIdModel(entidadBancariaId, newData);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json({ message: 'Entidad bancaria actualizada correctamente' });
  } catch (error) {
    
    console.error('Error al actualizar la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
//funcion para eliminar una entidad bancaria
export const estadoEntidadBancariaById = async (req, res) => {
  try {
    const entidadBancariaEstado = req.params.entidadBancariaEstado;
    const newData = req.body;
    
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar la entidad bancaria' });
    }

    const existingEntidadBancaria = await getEntidadBancariaByIdModel(entidadBancariaEstado);
    if (!existingEntidadBancaria) {
      return res.status(404).json({ error: 'La entidad bancaria con el ID proporcionado no existe' });
    }
    const result = await estadoEntidadBancariaByIdModel(entidadBancariaEstado, newData);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
  
   if(newData.estado == true){
     res.status(200).json({ message: 'Entidad bancaria activada correctamente' });
   }else{
    res.status(200).json({ message: 'Entidad bancaria inactivada correctamente' });

   }
   
  } catch (error) {
    
    console.error('Error al inactivar la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

