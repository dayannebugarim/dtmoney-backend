import { NextFunction, Request, Response } from "express";
import { CreateGoalUseCase } from "./CreateGoalUseCase";

class CreateGoalController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, name, description, value, endDate } = await req.body;

      const createGoalUseCase = new CreateGoalUseCase();

      const user = await createGoalUseCase.execute({
        userId,
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

export { CreateGoalController };
