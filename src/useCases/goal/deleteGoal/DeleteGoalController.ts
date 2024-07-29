import { Request, Response } from "express";
import { DeleteGoalUseCase } from "./DeleteGoalUseCase";

class DeleteGoalController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteGoalUseCase = new DeleteGoalUseCase();

    const user = await deleteGoalUseCase.execute({
      id,
    });

    return res.json(user);
  }
}

export { DeleteGoalController };
