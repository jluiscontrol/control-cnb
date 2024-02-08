//import { getEntidadBancariaModel, addEntidadBancariaModel} from '../models/EntidadBancaria.js';

import EntidadBancaria from '../models/EntidadBancaria.js';


export const createEntidadBancaria = async (req, res) => {
   
  const { entidad } = req.body

  const newEntidadBancaria = new EntidadBancaria({ entidad });
  
  const entidadBancariaSave = await newEntidadBancaria.save()
  res.status(201).json(entidadBancariaSave)

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