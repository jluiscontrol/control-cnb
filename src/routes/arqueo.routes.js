import { Router } from "express";

const router = Router()
import * as arqueoEncabezadoCtrl from '../controllers/arqueo.controller.js'
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/',  arqueoEncabezadoCtrl.createArqueo)
router.get('/', arqueoEncabezadoCtrl.getArqueo)
router.get('/:encabezadoarqueoId', arqueoEncabezadoCtrl.getArqueoById)
router.put('/:encabezadoarqueoId', arqueoEncabezadoCtrl.updateArqueoById)

export default router;