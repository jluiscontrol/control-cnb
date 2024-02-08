import { Router } from "express";
const router = Router()
import * as productsCtrl from '../controllers/products.controller.js'//importa todos mis controladores de la ruta producto


router.post('/', productsCtrl.createProduct)
router.get('/', productsCtrl.getProducts)
router.get('/:productId', productsCtrl.getProductById)
router.get('/:productId', productsCtrl.updateProductById)
router.get('/:productId', productsCtrl.deleteProductById)

export default router;