import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { CreateGoalController } from "../useCases/goal/createGoal/CreateGoalController";
import { ListGoalsController } from "../useCases/goal/listGoals/ListGoalsController";
import { GetGoalController } from "../useCases/goal/getGoal/GetGoalController";

const goalRoutes = Router();

const createGoalUseCase = new CreateGoalController();
const listGoalsUseCase = new ListGoalsController();
const getGoalUseCase = new GetGoalController();

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

export { goalRoutes };
