import { Router } from "express";

const router = Router()

import * as permisosCtrl from '../controllers/permisos.controller.js'//importa todos mis controladores de la ruta producto
import { verifyToken,  verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/', permisosCtrl.createPermisos)


export default router;