import { Router } from "express";

const router = Router()
import * as tipoTransaccionCtrl from '../controllers/tipotransaccion.controller.js'//importa todos mis controladores de la ruta 
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";


router.post('/', tipoTransaccionCtrl.createTipoTransaccion)
router.get('/', tipoTransaccionCtrl.getTipoTransacciones)
//rutas para obtener afecta caja y cuenta
router.get('/afectacaja', tipoTransaccionCtrl.getTipoAfectaCaja)
router.get('/afectacuenta', tipoTransaccionCtrl.getTipoAfectaCuenta)
/***** */

router.get('/:tipoTransacccionId', tipoTransaccionCtrl.getTipoTransaccionById)
router.put('/:tipoTransacccionId', tipoTransaccionCtrl.updateTipoTransaccionById)
router.delete('/:tipoTransacccionId', tipoTransaccionCtrl.deleteTipoTransaccionById)



export default router;