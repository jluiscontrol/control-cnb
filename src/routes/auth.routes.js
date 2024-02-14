import { Router } from "express";
const router = Router()

import * as authCtrl from '../controllers/auth.controller.js'//importa todos mis controladores de la ruta


router.get('/signup', authCtrl.signUp)
router.post('/signin', authCtrl.signIn)

export default router;