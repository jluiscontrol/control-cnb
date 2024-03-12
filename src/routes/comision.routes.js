import { Router } from "express";

const router = Router()
import * as comisionCtrl from '../controllers/comision.controllers.js'//importa todos mis controladores de la ruta 
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";


router.post('/',comisionCtrl.createComision)
router.get('/', comisionCtrl.getComision)
router.get('/:comisionId', comisionCtrl.getComisionId)
router.put('/:comisionId', comisionCtrl.updateComisionId)
router.put('/eliminar/:comisionDeleteId', comisionCtrl.deleteComision)


export default router;