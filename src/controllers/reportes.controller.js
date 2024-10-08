import { getOperationsReport, updateOperationStatus, getCajasReport } from '../models/Reportes.Model.js';

//funcion para obtener el reporte de operaciones por usuario
export const reporteOperaciones = async (req, res) => {
    const { id_usuario, id_caja, tipodocumento, desde, hasta, entidad, tipo_transaccion, estado } = req.query;

    try {
        const reporte = await getOperationsReport(id_usuario, id_caja, tipodocumento, desde, hasta, entidad, tipo_transaccion, estado);
        res.status(200).json(reporte);
    } catch (error) {
        console.error('Error al obtener el reporte de operaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

//funcion para cambiar el estado de la operacion
export const reporteEstadoOperaciones = async (req, res) => {
    const operacionId = req.params.operacionId;
    const { estado, comentario } = req.body;

    try {
        const reporte = await updateOperationStatus(operacionId, estado, comentario);
        res.status(200).json(reporte);
    } catch (error) {
        console.error('Error al obtener el reporte de operaciones:', error);
        res.status(500).json({ error: error });
    }
}

export const reporteCajas = async (req, res) => {
    const { fecha_desde, fecha_hasta, caja_id, id_usuario } = req.query;
    try {
        const reporte = await getCajasReport(fecha_desde, fecha_hasta, caja_id, id_usuario);
        res.status(200).json(reporte);
    } catch (error) {
        console.error('Error al obtener el reporte de las cajas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}