import { Router } from "express";

const router = Router()

import * as rutaVisibleCtrl from '../controllers/rutavisible.controller.js'

// GET /rutas - Obtiene todas las rutas.
router.get('/', rutaVisibleCtrl.getRutas)

// POST /rutavisible - Crea o actualiza una ruta visible.
router.post('/', rutaVisibleCtrl.createOrUpdate)

// GET /rutavisible/:id_rol/:id_usuario - Obtiene todas las rutas visibles para un rol o usuario específico.
router.get('/:id_usuario', rutaVisibleCtrl.getRutasVisibles);

export default router;