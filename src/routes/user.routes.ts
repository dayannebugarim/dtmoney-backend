import { Router } from "express";
import { CreateUserController } from "../useCases/createUser/CreateUserController";
import { GetUserController } from "../useCases/getUser/GetUserController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const usersRoutes = Router();

const createUserUseCase = new CreateUserController();
const getUserController = new GetUserController();

usersRoutes.post("/", createUserUseCase.handle);
usersRoutes.get("/:id", ensureAuthenticated, getUserController.handle);

export { usersRoutes };
