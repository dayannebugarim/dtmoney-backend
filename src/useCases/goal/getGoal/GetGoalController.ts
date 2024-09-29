import { NextFunction, Request, Response } from "express";
import { GetGoalUseCase } from "./GetGoalUseCase";

class GetGoalController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const getGoalUseCase = new GetGoalUseCase();

      const user = await getGoalUseCase.execute({
        id,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { GetGoalController };
