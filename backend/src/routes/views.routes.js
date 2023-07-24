import { Router } from "express";
import { Roles, checkRole, isSessionActive } from "../middlewares/session.js";
import { renderProducts, viewCart, viewChat, viewLogin, viewReset, viewRegister, viewForgot } from "../controllers/views.controller.js";

const routerViews = Router()

routerViews.get('/', viewLogin)
routerViews.get('/login', viewLogin)
routerViews.get('/register', viewRegister)
routerViews.get('/password/forgot', viewForgot)
routerViews.get('/password/reset/:token', viewReset)
routerViews.get('/products', isSessionActive, renderProducts)
routerViews.get('/carts/:cid', checkRole(Roles.USER), viewCart)
routerViews.get('/chat', isSessionActive, viewChat)

export default routerViews