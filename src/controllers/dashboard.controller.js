import { getLast15Operations, getTotalCommissions, getTodayCommissionsByBank } from '../models/Dashboard.Model.js';

export async function getDashboardData(req, res) {
    try {
        
        const operations = await getLast15Operations();
        const totalCommissions = await getTotalCommissions();
        const totalCommissionsByBank = await getTodayCommissionsByBank();

        res.json({
            operations,
            totalCommissions,
            totalCommissionsByBank
        });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
}