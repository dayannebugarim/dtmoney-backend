import { Router } from "express";
import { CreateUserController } from "../useCases/user/createUser/CreateUserController";
import { GetUserController } from "../useCases/user/getUser/GetUserController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const userRoutes = Router();

const createUserUseCase = new CreateUserController();
const getUserController = new GetUserController();

userRoutes.post("/", createUserUseCase.handle);
userRoutes.get("/:id", ensureAuthenticated, getUserController.handle);

export { userRoutes };
