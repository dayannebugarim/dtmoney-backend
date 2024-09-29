import { NextFunction, Request, Response } from "express";
import { DeleteTransactionUseCase } from "./DeleteTransactionUseCase";

class DeleteTransactionController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleteTransactionUseCase = new DeleteTransactionUseCase();

      const user = await deleteTransactionUseCase.execute({
        id,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { DeleteTransactionController };
