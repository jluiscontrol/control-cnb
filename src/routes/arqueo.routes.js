import { Router } from "express";
import * as arqueoEncabezadoCtrl from '../controllers/arqueo.controller.js'
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";

const router = Router();

// Rutas para CRUD de arqueos
router.post('/', [verifyToken], arqueoEncabezadoCtrl.createArqueo);
router.get('/', arqueoEncabezadoCtrl.getArqueo);
router.get('/:encabezadoarqueoId', arqueoEncabezadoCtrl.getArqueoById);
router.put('/:encabezadoarqueoId', arqueoEncabezadoCtrl.updateArqueoById);


export default router;
