import { NextFunction, Request, Response } from "express";
import { DeleteGoalUseCase } from "./DeleteGoalUseCase";

class DeleteGoalController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleteGoalUseCase = new DeleteGoalUseCase();

      const user = await deleteGoalUseCase.execute({
        id,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { DeleteGoalController };
