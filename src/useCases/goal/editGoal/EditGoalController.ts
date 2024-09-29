import { NextFunction, Request, Response } from "express";
import { EditGoalUseCase } from "./EditGoalUseCase";

class EditGoalController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, value, endDate } = await req.body;

      const editGoalUseCase = new EditGoalUseCase();

      const user = await editGoalUseCase.execute({
        id,
        name,
        description,
        value,
        endDate,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { EditGoalController };
