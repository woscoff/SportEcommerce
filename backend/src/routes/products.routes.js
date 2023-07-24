import { Router } from "express";
import { getProducts, getProduct, addProducts, modifyProduct, removeProduct } from "../controllers/product.controller.js";
import { Roles, checkRole, isSessionActive } from "../middlewares/session.js";

const routerProduct = Router()

routerProduct.route('/')
    .get(getProducts)
    .post(addProducts)

routerProduct.route('/:pid')
    .get(getProduct)
    .put(checkRole(Roles.ADMIN), modifyProduct)
    .delete(checkRole(Roles.ADMIN), removeProduct)

export default routerProduct