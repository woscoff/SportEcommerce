import { Router } from "express";
import { loginUser, destroySession, getSession, registerUser, sendResetPasswordLink, resetPassword } from "../controllers/session.controller.js";

const routerSession = Router()

routerSession.post('/login', loginUser)
routerSession.get('/logout', destroySession)
routerSession.get('/current', getSession)
routerSession.post('/register', registerUser)
routerSession.post('/password/createlink', sendResetPasswordLink)
routerSession.put('/password/reset', resetPassword)

export default routerSession