import { Router } from "express";
import * as arqueoEncabezadoCtrl from '../controllers/arqueo.controller.js'
import { verifyToken,  verifyEmpleado } from "../middlewares/auth.jwt.js";

const router = Router();

// Rutas para CRUD de arqueos
router.post('/', [verifyToken], arqueoEncabezadoCtrl.createArqueo);
router.get('/', arqueoEncabezadoCtrl.getArqueo); // Obtener los arqueos por fecha
router.get('/:encabezadoarqueoId', arqueoEncabezadoCtrl.getArqueoById); // Obtener un arqueo por su ID
router.put('/:encabezadoarqueoId', arqueoEncabezadoCtrl.updateArqueoById); // Actualizar los detalles del arqueo
router.get('/:encabezadoarqueoId/detalles', arqueoEncabezadoCtrl.getDetallesArqueo); // Obtener los detalles de un arqueo
router.get('/total/:encabezadoarqueoId', arqueoEncabezadoCtrl.getValoresArqueoByEncabezadoId); // Obtener todos los detalles de los arqueos
router.get('/apertura/total/:encabezadoarqueoId', arqueoEncabezadoCtrl.getvaloresArqueoByApertura);

export default router;
