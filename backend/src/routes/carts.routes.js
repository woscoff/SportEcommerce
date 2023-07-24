import { Router } from "express";
import { purchaseCart, getCart, addProduct, changeProductQuantity, clearCart, removeProduct, overwriteCart, createNewCart } from "../controllers/cart.controller.js";
import { Roles, checkRole, isSessionActive } from "../middlewares/session.js";

const routerCart = Router()

// Middlewares to use in every cart related request
routerCart.use(isSessionActive, checkRole(Roles.USER))

routerCart.route('/')
  .post(createNewCart)
  .get(getCart)
  .put(overwriteCart)
  .delete(clearCart)

routerCart.route('/product/:pid')
  .post(addProduct)
  .put(changeProductQuantity)
  .delete(removeProduct)

routerCart.route('/purchase')
  .post(purchaseCart)

export default routerCart