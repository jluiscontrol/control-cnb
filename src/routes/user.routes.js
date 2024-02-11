import { Router } from "express";

const router = Router()
import * as userCtrl from '../controllers/user.controller.js'//importa todos mis controladores de la ruta 


router.post('/', userCtrl.createUser)
router.get('/', userCtrl.getUsers)
router.get('/:userId', userCtrl.getUserById)
router.put('/:userId', userCtrl.updateUserById)
router.delete('/:userId', userCtrl.deleteUserById)



export default router;