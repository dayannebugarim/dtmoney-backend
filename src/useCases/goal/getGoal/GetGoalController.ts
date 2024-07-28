import { Request, Response } from "express";
import { GetGoalUseCase } from "./GetGoalUseCase";

class GetGoalController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const getGoalUseCase = new GetGoalUseCase();

    const user = await getGoalUseCase.execute({
      id,
    });

    return res.json(user);
  }
}

export { GetGoalController };
