import { Router } from "express";

const router = Router()

import * as permisosCtrl from '../controllers/permisos.controller.js'//importa todos mis controladores de la ruta producto
import { verifyToken,  verifyEmpleado } from "../middlewares/auth.jwt.js";

router.post('/', permisosCtrl.createPermisos)
router.get('/',permisosCtrl.getPermisos)
router.get('/:id_usuario',permisosCtrl.getPermisosUsuario)


export default router;