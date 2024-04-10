import { Router } from "express";

const router = Router()
import * as licenciaCtrl from '../controllers/Licencia.controller'//importa todos mis controladores de la ruta producto
//import { verifyToken,  verifyEmpleado } from "../middlewares/auth.jwt.js";


router.post('/',licenciaCtrl.consultaLicencia)


export default router;