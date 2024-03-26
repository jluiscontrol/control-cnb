import addTipoTransaccion from "../models/tipotransaccion.model.js"
import  getAllTiposTransaccion from "../models/tipotransaccion.model.js"
import  getAllTiposTransaccionActivos from "../models/tipotransaccion.model.js"
import  { updateTipoTransaccionId } from "../models/tipotransaccion.model.js"
import { getTipoTransaccionById as getTipoTransaccionByIdModel } from "../models/tipotransaccion.model.js"
import getAllTiposTransaccionByTipoDocumento from "../models/tipotransaccion.model.js"

export const createTipoTransaccion = async (req, res) => {
  const { nombre, afectacuenta_id, afectacaja_id, tipodocumento } = req.body;

  // Verificar si algún campo requerido está vacío
  if (!nombre || !afectacuenta_id || !afectacaja_id || !tipodocumento) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios..' });
  }
  try {
    // Llama a la función para registrar tipo de transaccion
    const userSave = await addTipoTransaccion.addTipoTransaccion({ nombre, afectacuenta_id, afectacaja_id, tipodocumento });
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

//funcion para obtener todos tipo de transaciones
export const getTTransaccionesActivas = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const tiposTransaccionactivos = await getAllTiposTransaccionActivos.getAllTiposTransaccionActivos();

    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(tiposTransaccionactivos);
  } catch (error) {
    console.error('Error al obtener entidades bancarias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//funcion para obtener un tipo de transaccion 
export const getTipoTransaccionById = async (req, res) => {
  try {
    // Llamar a la función del modelo para obtener la entidad bancaria por su ID
    const tipotransaccion = await getTipoTransaccionByIdModel(req.params.tipoTransacccionId);
    if (tipotransaccion.error) {
      // Si hay un error, devuelve un mensaje de error con estado 404
      return res.status(404).json({ error: tipotransaccion.error });
     // return res.status(404).json({ error: 'Error interno del servidor' });
    }
    // Si se encuentra la entidad bancaria, devuelve la entidad en la respuesta
    res.status(200).json(tipotransaccion);
  } catch (error) {
    // Manejar cualquier error que ocurra durante el proceso
    console.error('Error al obtener la entidad bancaria por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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

//obtener los datos de afecta caja
export const getTipoAfectaCaja = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const afectaCaja = await getAllTiposTransaccion.getAllAfectaCaja();

    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(afectaCaja);
  } catch (error) {
    console.error('Error al obtener datos de afecta caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//obtener los datos de afecta cuenta
export const getTipoAfectaCuenta = async (req, res) => {
  try {
    // Llamar a la función que obtiene todas las entidades bancarias desde tu modelo o servicio
    const afectaCuenta = await getAllTiposTransaccion.getAllAfectaCuenta();

    // Devolver las entidades bancarias en la respuesta
    res.status(200).json(afectaCuenta);
  } catch (error) {
    console.error('Error al obtener datos de afecta cuenta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//funcion para eliminar un tipo de transacion
export const deleteTipoTransaccionById = (req, res) => {
    
}


// export const TipoTransaccionByTipoDocumento = async (req, res) => {
//   try {
//     const tipodocumento = req.params.tipodocumento;
//     const tiposTransaccion = await getAllTiposTransaccionByTipoDocumento(tipodocumento);
//     res.status(200).json(tiposTransaccion);
//   } catch (error) {
//     console.error('Error al obtener los tipos de transaccion por tipo de documento:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// }

export async function TipoTransaccionByTipoDocumento(req, res) {
  try {
    const tipodocumento = req.params.tipodocumento; 
    const tiposTransaccion = await getAllTiposTransaccionByTipoDocumento(tipodocumento);
    res.status(200).json(tiposTransaccion);
  } catch (error) {
    console.error('Error al obtener los tipos de transaccion por tipo de documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}