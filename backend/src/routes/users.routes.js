import { Router } from "express";
import { eraseInactiveUsers, getUsers, uploadDocs } from "../controllers/user.controller.js";
import { Roles, checkRole, isSessionActive } from "../middlewares/session.js";
import { uploader } from "../utils/multer.js";

const routerUser = Router()

routerUser.get('/', isSessionActive, checkRole(Roles.ADMIN), getUsers)
routerUser.delete('/', isSessionActive, checkRole(Roles.ADMIN), eraseInactiveUsers)
routerUser.post('/:uid/documents', isSessionActive, uploader.single('file'), uploadDocs)

export default routerUser