
import EntidadBancaria from '../models/EntidadBancaria.Model.js';
import { getEntidadBancariaById as getEntidadBancariaByIdModel } from '../models/EntidadBancaria.Model.js'; 
import { updateEntidadBancariaById as updateEntidadBancariaByIdModel } from '../models/EntidadBancaria.Model.js'; 

//Funcion para crear una entidad bancaria
export const createEntidadBancaria = async (req, res) => {

  const { entidad } = req.body;

  try {
    const entidadBancariaSave = await EntidadBancaria.addEntidadBancaria({ entidad });
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

    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(entidadesBancarias);
  } catch (error) {
    console.error('Error al obtener entidades bancarias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//Funcion para obtener una entidad bancaria en especifico
export const getEntidadBancariaById = async (req, res) => {
  try {
    // Llamar a la función del modelo para obtener la entidad bancaria por su ID
    const entidadBancaria = await getEntidadBancariaByIdModel(req, res);
    res.status(200).json(entidadBancaria);
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al obtener la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateEntidadBancariaById = async (req, res) => {
  try {
    // Extraer el ID de la entidad bancaria de los parámetros de la solicitud
    const entidadBancariaId = req.params.entidadBancariaId;
    
    // Obtener los datos actualizados del cuerpo de la solicitud
    const newData = req.body;
    
    // Llamar a la función del modelo para actualizar la entidad bancaria
    const result = await updateEntidadBancariaByIdModel(entidadBancariaId, newData); // Aquí utilizamos la función del modelo
    
    // Devolver un mensaje de éxito en la respuesta
    res.status(200).json(result);
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al actualizar la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const deleteEntidadBancariaById = async (req, res) => {

}