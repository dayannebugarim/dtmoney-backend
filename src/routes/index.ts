import { Router } from "express";
import { userRoutes } from "./user.routes";
import { authRoutes } from "./auth.routes";
import { transactionRoutes } from "./transaction.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/transaction", transactionRoutes);

export { router };
