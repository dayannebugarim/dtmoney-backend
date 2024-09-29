import { NextFunction, Request, Response } from "express";
import { CreateTransactionUseCase } from "./CreateTransactionUseCase";

class CreateTransactionController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, value, type, description, categoryId, goalId } =
        await req.body;

      const createTransactionUseCase = new CreateTransactionUseCase();

      const user = await createTransactionUseCase.execute({
        userId,
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

export { CreateTransactionController };
