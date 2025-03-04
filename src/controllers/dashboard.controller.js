import {
    getLast15Operations,
    getTotalCommissions,
    getTodayCommissionsByBank,
    getMonthlyOperationsDataForDashboard,
    getTotalOperaciones,
    getTotalComisiones,
    getTotalSaldoCaja,
    getLicenciaCliente
} from '../models/Dashboard.Model.js';

export async function getDashboardData(req, res) {
    try {

        const operations = await getLast15Operations();
        const totalCommissions = await getTotalCommissions();
        const totalCommissionsByBank = await getTodayCommissionsByBank();
        const monthlyOperations = await getMonthlyOperationsDataForDashboard();
        const totalOperaciones = await getTotalOperaciones();
        const totalComisiones = await getTotalComisiones();
        const totalSaldoCaja = await getTotalSaldoCaja();
        
        res.json({
            operations,
            totalCommissions,
            totalCommissionsByBank,
            monthlyOperations,
            totalOperaciones,
            totalComisiones,
            totalSaldoCaja
        });

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}



export async function getLicencia(req, res) {
    try {
        const nident = req.query.nident;
        const licencia = await getLicenciaCliente(nident);

        res.json({ licencia });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}