import { Router } from "express";

const router = Router()

import * as rolesCtrl from '../controllers/roles.controller.js'//importa todos mis controladores de la ruta producto
import { verifyToken,  verifyEmpleado } from "../middlewares/auth.jwt.js";


router.get('/', rolesCtrl.getRoles)
/*router.post('/',operacionesCtrl.createOperaciones)
router.get('/filter', operacionesCtrl.getOperacionesFilter)
router.get('/:operacionesId', operacionesCtrl.getOperacionesById)
router.put('/:operacionesId', operacionesCtrl.updateOperacionesById)
router.delete('/:operacionesId', operacionesCtrl.deleteOperacionesById)*/



export default router;