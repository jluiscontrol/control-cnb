import { Router } from "express";

const router = Router()

import * as reportesCtrl from '../controllers/reportes.controller.js'//importa todos mis controladores de la ruta producto

router.get('/operaciones', reportesCtrl.reporteOperaciones)
router.get('/cajas', reportesCtrl.reporteCajas)
router.put('/estado/operaciones/:operacionId', reportesCtrl.reporteEstadoOperaciones)

export default router;
