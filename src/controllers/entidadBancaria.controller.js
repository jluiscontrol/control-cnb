import { getEntidadBancariaModel, addEntidadBancariaModel} from '../models/EntidadBancaria.js';


export const createEntidadBancaria = (req, res) => {
  console.log(req.body, 'quemado')  
  res.json('creando entidad bancaria');
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