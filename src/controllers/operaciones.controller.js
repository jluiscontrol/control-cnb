import * as operaciones from '../models/Operaciones.Model.js'
import  {existeNumTransaccion}  from '../helpers/funciones.js';

export const createOperaciones = async (req, res) => {
    const { id_entidadbancaria,
        id_tipotransaccion,
        id_cliente,
        valor,
        referencia,
        comentario,
        numtransaccion } = req.body;

    if (!id_entidadbancaria || !id_tipotransaccion || !id_cliente || !valor || !numtransaccion) {
        return res.status(400).json('Algunos campo son obligatorios');
    }
    // Validar tipos de datos
    if (typeof id_entidadbancaria !== 'number' || typeof id_tipotransaccion !== 'number' || typeof id_cliente !== 'number' || typeof valor !== 'number' || typeof numtransaccion !== 'number') {
        return res.status(400).json({ error: 'Error al agregar operación: Verifique los tipos de datos de los campos.' });
    }
    // Validar formato de numtransaccion con expresión regular
    const numTransaccionRegex = /^[0-9]+$/; // Solo permite números
    if (!numTransaccionRegex.test(numtransaccion)) {
        return res.status(400).json({ error: 'Error al agregar operación: El número de transacción debe contener solo números.' });
    }

    try {
    // llama a la funcion valida numero transaccion
    const numTransaccionExistente = await existeNumTransaccion(numtransaccion);
        if (numTransaccionExistente) {
    return res.status(400).json({
        error: `El número de comprobante '${numtransaccion}' ya existe en la transacción: ${numTransaccionExistente}`,
       
        });
    }
        
        const operacionSave = await operaciones.addOperaciones({
            id_entidadbancaria,
            id_tipotransaccion,
            id_cliente,
            valor,
            referencia,
            comentario,
            numtransaccion
        });
        res.status(201).json(operacionSave);
    } catch (error) {
        console.error('Error al crear operacion:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

}
export const getOperaciones = async (req, res) => {

}
export const getOperacionesById = async (req, res) => {

}
export const updateOperacionesById = async (req, res) => {

}
export const deleteOperacionesById = async (req, res) => {

}