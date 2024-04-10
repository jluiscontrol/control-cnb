import { Router } from "express";

const router = Router()
import * as dashboard from '../controllers/dashboard.controller.js'

router.get('/', dashboard.getDashboardData);
router.get('/licencia', dashboard.getLicencia);

export default router;