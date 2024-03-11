import { Router } from "express";

const router = Router()

import * as operacionesCtrl from '../controllers/operaciones.controller.js'//importa todos mis controladores de la ruta producto
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";


router.post('/',operacionesCtrl.createOperaciones)
router.get('/', operacionesCtrl.getOperaciones)
router.get('/filter', operacionesCtrl.getOperacionesFilter)
router.get('/:operacionesId', operacionesCtrl.getOperacionesById)
router.put('/:operacionesId', operacionesCtrl.updateOperacionesId)
router.put('/eliminar/:operacionesDeleteId', operacionesCtrl.deleteOperacionesId)



export default router;