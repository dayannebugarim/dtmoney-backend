import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { CreateGoalController } from "../useCases/goal/createGoal/CreateGoalController";
import { ListGoalsController } from "../useCases/goal/listGoals/ListGoalsController";
import { GetGoalController } from "../useCases/goal/getGoal/GetGoalController";
import { EditGoalController } from "../useCases/goal/editGoal/EditGoalController";
import { DeleteGoalController } from "../useCases/goal/deleteGoal/DeleteGoalController";

const goalRoutes = Router();

const createGoalController = new CreateGoalController();
const listGoalsController = new ListGoalsController();
const getGoalController = new GetGoalController();
const editGoalController = new EditGoalController();
const deleteGoalController = new DeleteGoalController();

goalRoutes.post(
  "/",
  ensureAuthenticated,
  createGoalController.handle
);

goalRoutes.get(
  "/",
  ensureAuthenticated,
  listGoalsController.handle
);

goalRoutes.get(
  "/:id",
  ensureAuthenticated,
  getGoalController.handle
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
