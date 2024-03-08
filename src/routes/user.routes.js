import { Router } from "express";

const router = Router()
import * as userCtrl from '../controllers/user.controller.js'//importa todos mis controladores de la ruta 
import { verifyToken, verifyAdmin, verifyEmpleado } from "../middlewares/auth.jwt.js";


router.post('/',[verifyToken, verifyAdmin], userCtrl.createUser)
router.get('/', userCtrl.getUsers)
router.get('/:userId', userCtrl.getUserById)
router.put('/:userId', userCtrl.updateUserById)
router.put('/:userDeleteId', userCtrl.deleteUserById)

//creacion de caja
router.post('/caja', userCtrl.createCaja)


export default router;