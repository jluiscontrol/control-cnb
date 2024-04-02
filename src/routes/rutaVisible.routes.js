import { Router } from "express";

const router = Router()

import * as rutaVisibleCtrl from '../controllers/rutavisible.controller.js'

// POST /rutavisible - Crea una nueva ruta visible para un rol o usuario.
router.post('/', rutaVisibleCtrl.createRutaVisible);

// DELETE /rutavisible/:id - Elimina una ruta visible por su ID.
router.delete('/:id', rutaVisibleCtrl.deleteRutaVisible);

// GET /rutavisible/:id_rol/:id_usuario - Obtiene todas las rutas visibles para un rol o usuario específico.
router.get('/:id_usuario', rutaVisibleCtrl.getRutasVisibles);

export default router;