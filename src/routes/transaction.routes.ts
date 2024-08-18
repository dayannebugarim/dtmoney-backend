import { Router } from "express";
import { CreateTransactionController } from "../useCases/transaction/createTransaction/CreateTransactionController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { SearchTransactionController } from "../useCases/transaction/searchTransaction/SearchTransactionController";
import { ListCategoriesController } from "../useCases/transaction/listCategories/ListCategoriesController";
import { CreateCategoryController } from "../useCases/transaction/createCategory/CreateCategoryController";
import { SetCategoryController } from "../useCases/transaction/setCategory/SetCategoryController";
import { EditTransactionController } from "../useCases/transaction/editTransaction/EditTransactionController";
import { DeleteTransactionController } from "../useCases/transaction/deleteTransaction/DeleteTransactionController";
import { GetSummaryController } from "../useCases/transaction/getSummary/GetSummaryController";
import { GetSummaryByPeriodController } from "../useCases/transaction/getSummaryByPeriod/GetSummaryByPeriodController";

const transactionRoutes = Router();

const searchTransactionController = new SearchTransactionController();
const createTransactionController = new CreateTransactionController();
const editTransactionController = new EditTransactionController();
const deleteTransactionController = new DeleteTransactionController();
const listCategoriesController = new ListCategoriesController();
const createCategoryController = new CreateCategoryController();
const setCategoryController = new SetCategoryController();
const getSummaryController = new GetSummaryController()
const getSummaryByPeriodController = new GetSummaryByPeriodController()

transactionRoutes.get(
  "/",
  ensureAuthenticated,
  searchTransactionController.handle
);

transactionRoutes.post(
  "/",
  ensureAuthenticated,
  createTransactionController.handle
);

transactionRoutes.put(
  "/:id",
  ensureAuthenticated,
  editTransactionController.handle
);

transactionRoutes.delete(
  "/:id",
  ensureAuthenticated,
  deleteTransactionController.handle
);

transactionRoutes.get(
  "/category",
  ensureAuthenticated,
  listCategoriesController.handle
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

transactionRoutes.get(
  "/summary/:userId",
  ensureAuthenticated,
  getSummaryController.handle
);

transactionRoutes.get(
  "/periodicSummary/:userId",
  ensureAuthenticated,
  getSummaryByPeriodController.handle
);

export { transactionRoutes };
