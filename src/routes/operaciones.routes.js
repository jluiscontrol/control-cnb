import { Router } from "express";
const router = Router();

import * as operacionesCtrl from '../controllers/operaciones.controller.js';
import { verifyToken, verifyPermissions, verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/', [verifyToken, verifyPermissions], operacionesCtrl.createOperaciones);
router.get('/', operacionesCtrl.getOperaciones); // Esta ruta se utilizará para obtener todas las operaciones o filtradas por ID de caja
router.get('/unique', operacionesCtrl.getAllOperacionesUnique);
router.get('/filter', operacionesCtrl.getOperacionesFilter);
router.put('/:operacionesId', operacionesCtrl.updateOperacionesId);
router.put('/eliminar/:operacionesDeleteId', operacionesCtrl.deleteOperacionesId);
router.get('/byEntidadId/:entidadId', operacionesCtrl.getOperacionesByEntidad);

export default router;
