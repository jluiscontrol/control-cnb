import addTipoTransaccion from "../models/tipotransaccion.model.js"
import  getAllTiposTransaccion from "../models/tipotransaccion.model.js"
import  { updateTipoTransaccionId } from "../models/tipotransaccion.model.js"
import { getTipoTransaccionById as getTipoTransaccionByIdModel } from "../models/tipotransaccion.model.js"



export const createTipoTransaccion = async (req, res) => {
  const { nombre, afectacuenta_id, afectacaja_id  } = req.body;

  // Verificar si algún campo requerido está vacío
  if (!nombre || !afectacuenta_id || !afectacaja_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios..' });
  }
  try {
    // Llama a la función para registrar tipo de transaccion
    const userSave = await addTipoTransaccion.addTipoTransaccion({ nombre, afectacuenta_id, afectacaja_id });
    res.status(201).json(userSave);
  } catch (error) {
    if (error.message === 'El tipo de transacción ya existe' ) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear tipo transaccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//funcion para obtener todos tipo de transaciones
export const getTipoTransacciones = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const tiposTransaccion = await getAllTiposTransaccion.getAllTiposTransaccion();

    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(tiposTransaccion);
  } catch (error) {
    console.error('Error al obtener entidades bancarias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//funcion para obtener un tipo de transaccion 
export const getTipoTransaccionById = async (req, res) => {
  /*try {
    // Llamar a la función del modelo para obtener la entidad bancaria por su ID
    const tipotransa = await getTipoTransaccionByIdModel(req, res);
    res.status(200).json(tipotransa);
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al obtener el tipo transaccion por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }*/
}

//funcion para actulizar un tipo de transaccion
export const updateTipoTransaccionById = async (req, res) => {
  try {
    
    const tipoTransacccionId = req.params.tipoTransacccionId;
    const newData = req.body;

    const result = await updateTipoTransaccionId(tipoTransacccionId, newData); // Aquí utilizamos la función del modelo
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al actualizar el tipo de transaccion por  ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//funcion para eliminar un tipo de transacion
export const deleteTipoTransaccionById = (req, res) => {
    
}