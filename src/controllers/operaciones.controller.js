import * as operaciones from '../models/Operaciones.Model.js'
import { existeNumTransaccion, obtenerSobregiroPermitido } from '../helpers/funciones.js';
import { updateOperacionesById } from '../models/Operaciones.Model.js';
import { deleteOperacionesById } from '../models/Operaciones.Model.js';
import { getOperacionesByEntidadBancariaId } from '../models/Operaciones.Model.js';

export const createOperaciones = async (req, res) => {
  const {
    id_entidadbancaria,
    id_tipotransaccion,
    id_persona,
    valor,
    referencia,
    comentario,
    numtransaccion,
    id_usuario,
    saldocomision,
    estado,
    tipodocumento,
    id_caja
  } = req.body;

  if (!id_entidadbancaria || !id_tipotransaccion || !valor || !tipodocumento) {
    return res.status(400).json('Algunos campos son obligatorios');
  }

  // Validar tipos de datos
  if (typeof id_entidadbancaria !== 'number' || typeof id_tipotransaccion !== 'number' || typeof valor !== 'number') {
    return res.status(400).json({ error: 'Error al agregar operación: Verifique los tipos de datos de los campos.' });
  }

  try {
    // Llama a la función para validar el número de transacción
    const numTransaccionExistente = await existeNumTransaccion(numtransaccion);
    if (numTransaccionExistente) {
      return res.status(400).json({
        error: `El número de comprobante '${numtransaccion}' ya existe en la transacción: ${numTransaccionExistente}`,
      });
    }

    // Guardar la operación
    const operacionSave = await operaciones.addOperaciones({
      id_entidadbancaria,
      id_tipotransaccion,
      id_persona,
      valor,
      referencia,
      comentario,
      numtransaccion,
      id_usuario,
      saldocomision,
      estado,
      tipodocumento,
      id_caja
    });
    res.status(201).json(operacionSave);
  } catch (error) {

    if (error.message.includes('La operación excede el límite del sobregiro permitido para esta entidad bancaria.')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear operación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}


//Funcion para obtener todas las operaciones
export const getOperaciones = async (req, res) => {
  try {
    // Obtén el ID de la caja desde los parámetros de consulta de la URL (req.query.id_caja)
    const { id_caja } = req.query;

    // Llama a la función getAllOperaciones desde el modelo y pásale el ID de la caja como parámetro
    const result = await operaciones.getAllOperaciones(id_caja);

    // Devuelve las operaciones en la respuesta
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener operaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

//Funcion para obtener todas las operaciones unicas
export const getAllOperacionesUnique = async (req, res) => {
  try {
    // Obtener el id de la caja de los parámetros de consulta de la URL (req.query.id_caja)
    const { id_caja } = req.query;

    // Verificar si se proporcionó el id de la caja
    if (!id_caja) {
      return res.status(400).json({ error: 'Falta el id de la caja.' });
    }

    // Llamar a la función que obtiene las operaciones únicas por caja desde el modelo
    const result = await operaciones.getAllOperacionesUnique(id_caja);

    // Devolver las operaciones en la respuesta
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener operaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


//Funcion para obtener todas las operaciones filtado por fechas
export const getOperacionesFilter = async (req, res) => {
  try {
    // Obtener los parámetros de fecha desde el cuerpo de la solicitud
    const { fechaDesde, fechaHasta } = req.body;

    // Llamar a la función para obtener todas las operaciones filtradas por fechas
    const resultado = await operaciones.getAllOperacionesFilter(fechaDesde, fechaHasta);

    // Enviar la respuesta con las operaciones obtenidas
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener operaciones filtradas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const getOperacionesByEntidad = async (req, res) => {
  const entidadId = req.params.entidadId; // Obtén el ID de la entidad de los parámetros de la solicitud
  const id_caja = req.query.id_caja; // Obtén el ID de la caja de los parámetros de consulta de la URL

  try {
    const operaciones = await getOperacionesByEntidadBancariaId(entidadId, id_caja);
    res.status(200).json(operaciones);
  } catch (error) {
    console.error('Error al obtener operaciones por entidad bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateOperacionesId = async (req, res) => {
  try {
    const operacionesId = req.params.operacionesId; // Obtén el ID de la operación de los parámetros de la solicitud
    const newData = req.body; // Obtén los nuevos datos de la operación del cuerpo de la solicitud

    // Verifica si los nuevos datos son válidos
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para editar la operación' });
    }

    // Llama a la función para actualizar la operación con los datos proporcionados
    const result = await updateOperacionesById(operacionesId, newData);

    // Verifica si hubo un error al actualizar la operación
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    // Devuelve un mensaje de éxito si la operación se actualizó correctamente
    res.status(200).json({ message: 'Operación actualizada correctamente' });
  } catch (error) {
    // Maneja cualquier error interno del servidor
    console.error('Error al actualizar la operación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const deleteOperacionesId = async (req, res) => {
  try {
    const operacionesDeleteId = req.params.operacionesDeleteId;
    const newData = req.body;

    // Verifica si los nuevos datos son válidos
    if (!newData || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Se requieren datos actualizados para eliminar la operación' });
    }

    const result = await deleteOperacionesById(operacionesDeleteId, newData);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    res.status(200).json({ message: 'Operación eliminada correctamente' });
  } catch (error) {

    console.error('Error al eliminar la operación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getComisionByBankandTransa = async (req, res) => {

}

export const getTotalComisionesDiaAnterior = async (req, res) => {
  try {
    const id_caja = req.params.id_caja;
    const result = await operaciones.totalcomisionesdiaanterior(id_caja);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el total de comisiones del día anterior:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getTotalComisionesDiaAnteriorPorEtidad = async (req, res) => {
  try {
    const id_entidadbancaria = req.params.id_entidadbancaria;
    const id_caja = req.params.id_caja;
    const result = await operaciones.totalcomisionesdiaanteriorporentidad(id_entidadbancaria, id_caja );
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el total de comisiones del día anterior:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const getTotalSaldoDiaAnterior = async (req, res) => {
  try {
    const id_caja = req.params.id_caja;
    const result = await operaciones.totalsaldodiaanterior(id_caja);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el total de saldo del día anterior:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
