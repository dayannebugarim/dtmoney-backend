import { Request, Response } from "express";
import { CreateGoalUseCase } from "./CreateGoalUseCase";

class CreateGoalController {
  async handle(req: Request, res: Response) {
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
  }
}

export { CreateGoalController };
