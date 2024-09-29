import { NextFunction, Request, Response } from "express";
import { ListGoalsUseCase } from "./ListGoalsUseCase";

class ListGoalsController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query;

      const listGoalsUseCase = new ListGoalsUseCase();

      const user = await listGoalsUseCase.execute({
        userId: userId?.toString() || null,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { ListGoalsController };
