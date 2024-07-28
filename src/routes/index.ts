import { Router } from "express";
import { userRoutes } from "./user.routes";
import { authRoutes } from "./auth.routes";
import { transactionRoutes } from "./transaction.routes";
import { goalRoutes } from "./goal.routes";

const router = Router();

router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/transaction", transactionRoutes);
router.use("/goal", goalRoutes);

export { router };
