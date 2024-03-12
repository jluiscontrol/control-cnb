import Comision from '../models/Comision.Model.js'

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


export const getComision = async (req, res) => {

}
export const getComisionId = async (req, res) => {

}
export const updateComisionId = async (req, res) => {

}
export const deleteComision = async (req, res) => {

}