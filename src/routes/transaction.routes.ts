import { Router } from "express";
import { CreateTransactionController } from "../useCases/transaction/createTransaction/CreateTransactionController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { CreateCategoryController } from "../useCases/transaction/createCategory/CreateCategoryController";
import { SetCategoryController } from "../useCases/transaction/setCategory/SetCategoryController";

const transactionRoutes = Router();

const createTransactionUseCase = new CreateTransactionController();
const createCategoryController = new CreateCategoryController();
const setCategoryController = new SetCategoryController();

transactionRoutes.post(
  "/",
  ensureAuthenticated,
  createTransactionUseCase.handle
);

transactionRoutes.post(
  "/category",
  ensureAuthenticated,
  createCategoryController.handle
);

transactionRoutes.put(
  "/category",
  ensureAuthenticated,
  setCategoryController.handle
);

export { transactionRoutes };
