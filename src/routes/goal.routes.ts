import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { CreateGoalController } from "../useCases/goal/createGoal/CreateGoalController";
import { ListGoalsController } from "../useCases/goal/listGoals/ListGoalsController";
import { GetGoalController } from "../useCases/goal/getGoal/GetGoalController";
import { EditGoalController } from "../useCases/goal/editGoal/EditGoalController";
import { DeleteGoalController } from "../useCases/goal/deleteGoal/DeleteGoalController";

const goalRoutes = Router();

const createGoalUseCase = new CreateGoalController();
const listGoalsUseCase = new ListGoalsController();
const getGoalUseCase = new GetGoalController();
const editGoalController = new EditGoalController();
const deleteGoalController = new DeleteGoalController();

goalRoutes.post(
  "/",
  ensureAuthenticated,
  createGoalUseCase.handle
);

goalRoutes.get(
  "/",
  ensureAuthenticated,
  listGoalsUseCase.handle
);

goalRoutes.get(
  "/:id",
  ensureAuthenticated,
  getGoalUseCase.handle
);

goalRoutes.put(
  "/:id",
  ensureAuthenticated,
  editGoalController.handle
);

goalRoutes.delete(
  "/:id",
  ensureAuthenticated,
  deleteGoalController.handle
);

export { goalRoutes };
