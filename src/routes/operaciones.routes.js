import { Router } from "express";
const router = Router();

import * as operacionesCtrl from '../controllers/operaciones.controller.js';
import { verifyToken, verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/', [verifyToken], operacionesCtrl.createOperaciones);
router.get('/', operacionesCtrl.getOperaciones); // Esta ruta se utilizará para obtener todas las operaciones o filtradas por ID de caja
router.get('/all', operacionesCtrl.getTodasOperaciones) // cambiar ruta
router.get('/unique', operacionesCtrl.getAllOperacionesUnique);
router.get('/filter', operacionesCtrl.getOperacionesFilter);
router.put('/:operacionesId', operacionesCtrl.updateOperacionesId);
router.put('/eliminar/:operacionesDeleteId', operacionesCtrl.deleteOperacionesId);
router.get('/byEntidadId/:entidadId', operacionesCtrl.getOperacionesByEntidad);
router.get ('/totalcomisionesdiaanterior/:id_caja', operacionesCtrl.getTotalComisionesDiaAnterior);
router.get('/totalcomisionesdiaanteriorporentidad/:id_entidadbancaria/:id_caja', operacionesCtrl.getTotalComisionesDiaAnteriorPorEtidad);
router.get('/totalcajadeldia/:id_caja', operacionesCtrl.getTotalCajaDelDia);

export default router;
