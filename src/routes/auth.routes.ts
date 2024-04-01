import { Router } from "express";
import { AuthenticateUserController } from "../useCases/authenticateUser/AuthenticateUserController";
import { RefreshTokenUserController } from "../useCases/refreshTokenUser/RefreshTokenUserController";

const authRoutes = Router();

const authenticateUserController = new AuthenticateUserController();
const refreshTokenUserController = new RefreshTokenUserController();

authRoutes.post("/login", authenticateUserController.handle);
authRoutes.post("/refresh-token", refreshTokenUserController.handle);

export { authRoutes };
