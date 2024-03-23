import { getLast15Operations, getTotalCommissions, getTodayCommissionsByBank, getMonthlyOperationsDataForDashboard } from '../models/Dashboard.Model.js';

export async function getDashboardData(req, res) {
    try {
        
        const operations = await getLast15Operations();
        const totalCommissions = await getTotalCommissions();
        const totalCommissionsByBank = await getTodayCommissionsByBank();
        const monthlyOperations = await getMonthlyOperationsDataForDashboard();

        res.json({
            operations,
            totalCommissions,
            totalCommissionsByBank,
            monthlyOperations
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}