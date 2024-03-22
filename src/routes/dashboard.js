import { Router } from "express";

const router = Router()
import * as dashboard from '../controllers/dashboard.controller.js'

router.get('/', dashboard.getDashboardData);

export default router;