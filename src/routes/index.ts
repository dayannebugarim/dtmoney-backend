import { Router } from "express";
import { usersRoutes } from "./user.routes";
import { authRoutes } from "./auth.routes";

const router = Router();

router.use("/user", usersRoutes);
router.use("/auth", authRoutes);

export { router };
