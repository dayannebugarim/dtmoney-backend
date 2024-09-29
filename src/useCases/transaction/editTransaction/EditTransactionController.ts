import { NextFunction, Request, Response } from "express";
import { EditTransactionUseCase } from "./EditTransactionUseCase";

class EditTransactionController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, value, type, description, categoryId, goalId } =
        await req.body;

      const editTransactionUseCase = new EditTransactionUseCase();

      const user = await editTransactionUseCase.execute({
        id,
        date,
        value,
        type,
        description,
        categoryId,
        goalId,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { EditTransactionController };
