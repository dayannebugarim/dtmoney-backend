import { Request, Response } from "express";
import { EditGoalUseCase } from "./EditGoalUseCase";

class EditGoalController {
  async handle(req: Request, res: Response) {
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
  }
}

export { EditGoalController };
