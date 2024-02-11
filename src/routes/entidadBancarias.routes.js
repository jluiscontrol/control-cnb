import { Router } from "express";

const router = Router()
import * as entidadBancariaCtrl from '../controllers/entidadBancaria.controller.js'//importa todos mis controladores de la ruta producto


router.post('/', entidadBancariaCtrl.createEntidadBancaria)
router.get('/', entidadBancariaCtrl.getEntidadBancarias)
router.get('/:entidadBancariaId', entidadBancariaCtrl.getEntidadBancariaById)
router.put('/:entidadBancariaId', entidadBancariaCtrl.updateEntidadBancariaById)
router.delete('/:entidadBancariaId', entidadBancariaCtrl.deleteEntidadBancariaById)



export default router;