
import EntidadBancaria from '../models/EntidadBancaria.js';

export const createEntidadBancaria = async (req, res) => {
   
  const { entidad } = req.body;

  try {
    const entidadBancariaSave = await EntidadBancaria.addEntidadBancaria({ entidad });
    res.status(201).json(entidadBancariaSave);
  } catch (error) {
    console.error('Error al crear entidad bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getEntidadBancarias = (req, res) => {
    res.json('get entidad bancarias')
}

export const getEntidadBancaria = (req, res) => {
    
}
export const getEntidadBancariaById = (req, res) => {
    
}
export const updateEntidadBancariaById = (req, res) => {
    
}
export const deleteEntidadBancariaById = (req, res) => {
    
}