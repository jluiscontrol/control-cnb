import Comision from '../models/Comision.Model.js'
import obtenerValorComisionByEntidadYtipoTransaccion from '../models/Comision.Model.js'

export const createComision = async (req, res) => {
  const { valorcomision, entidadbancaria_id, tipotransaccion_id, estado } = req.body;

  if (!valorcomision || !entidadbancaria_id || !tipotransaccion_id ) {
    return res.status(400).json({ error: 'Los campos valorcomision, entidadbancaria_id y tipotransaccion_id son obligatorios.' });
  }

  try {
    // Agregar la comisión
    const resultSave = await Comision.addComision({ valorcomision, entidadbancaria_id, tipotransaccion_id, estado });

    // Verificar si la comisión ya existe
    if (resultSave && resultSave.exists) {
      return res.status(400).json({ error: 'La entidad bancaria elegida ya cuenta con valores de comisión.' });
    }

    // Convertir valorcomision a formato JSON
    const valorComisionJSON = JSON.stringify(valorcomision);

    const result = await Comision.addComision({ valorcomision: valorComisionJSON, entidadbancaria_id, tipotransaccion_id, estado });
    
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error al crear comisión:', error);
    res.status(500).json({ error: 'Se produjo un error al crear la comisión.' });
  }
}

//funcion para obtener todas las comisiones
export const getComision= async (req, res) => {
  try {
    const comision = await Comision.getAllComisiones();
    res.status(200).json(comision);
  } catch (error) {
    console.error('Error al obtener las comisiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
//funcion para obtener todas las comisiones activas
export const getComisionActivas = async (req, res) => {
  try {
    const comision = await Comision.getAllComisionesActivas();
    res.status(200).json(comision);
  } catch (error) {
    console.error('Error al obtener las comisiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
export const getComisionId = async (req, res) => {

}


//funcion para actualizar las comisiones
export const updateComisionId = async (req, res) => {
  
  const comisionId = req.params.comisionId;
  console.log(comisionId)
  const { valorcomision, entidadbancaria_id, tipotransaccion_id, estado } = req.body;

  if ( !valorcomision || !entidadbancaria_id || !tipotransaccion_id) {
    return res.status(400).json({ error: 'Los campos  valorcomision, entidadbancaria_id y tipotransaccion_id son obligatorios.' });
  }

  try {
    // Actualizar la comisión
    const result = await Comision.updateComision({ comisionId, valorcomision, entidadbancaria_id, tipotransaccion_id, estado });
    
    if (!result) {
      return res.status(404).json({ error: 'La comisión a actualizar no fue encontrada.' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    res.status(500).json({ error: 'Se produjo un error al actualizar la comisión.' });
  }
}
export const deleteComision = async (req, res) => {

}

  
export const getByEntidadYtipoTransaccion = async (req, res) => {
  const { entidadId, tipoTransaccionId } = req.params;
  try {
    const comisiones = await Comision.obtenerValorComisionByEntidadYtipoTransaccion(parseInt(entidadId), parseInt(tipoTransaccionId));
    console.log(comisiones)
    
    // Extraer solo el valor de la comisión de cada resultado
    const valoresComision = comisiones.map(comision => comision.valorcomision);
    
    res.json(valoresComision);
  } catch (error) {
    console.error('Error al obtener las comisiones:', error);
    res.status(500).json({ mensaje: 'Error al obtener las comisiones' });
  }
};