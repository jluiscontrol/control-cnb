import { getOperationsReport } from '../models/Reportes.Model.js';

export const reporteOperaciones = async (req, res) => {
    const { id_usuario, desde, hasta } = req.query;
    console.log('id_usuario:', id_usuario);
    console.log('desde:', desde);
    console.log('hasta:', hasta);
    try {
        const reporte = await getOperationsReport(id_usuario, desde, hasta);
        res.status(200).json(reporte);
    } catch (error) {
        console.error('Error al obtener el reporte de operaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
//funcion para obtener el reporte de operaciones por usuario