import { Router } from "express";
import { CreateUserController } from "../useCases/user/createUser/CreateUserController";
import { GetUserController } from "../useCases/user/getUser/GetUserController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const userRoutes = Router();

const createUserController = new CreateUserController();
const getUserController = new GetUserController();

userRoutes.post("/", createUserController.handle);
userRoutes.get("/:id", ensureAuthenticated, getUserController.handle);

export { userRoutes };
