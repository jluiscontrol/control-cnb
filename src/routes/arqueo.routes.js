import { Router } from "express";

const router = Router()
import * as arqueoEncabezadoCtrl from '../controllers/arqueo.controller.js'
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/', [ verifyToken ], arqueoEncabezadoCtrl.createArqueo)
router.get('/', arqueoEncabezadoCtrl.getArqueo)
router.get('/:encabezadoarqueoId', arqueoEncabezadoCtrl.getArqueoById)
router.put('/:encabezadoarqueoId', arqueoEncabezadoCtrl.updateArqueoById)

//ruta para obtener los reportes
router.get('/reporte', arqueoEncabezadoCtrl.getArqueo)

export default router;