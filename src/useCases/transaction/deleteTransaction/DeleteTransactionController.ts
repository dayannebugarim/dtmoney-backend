import { Request, Response } from "express";
import { DeleteTransactionUseCase } from "./DeleteTransactionUseCase";

class DeleteTransactionController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteTransactionUseCase = new DeleteTransactionUseCase();

    const user = await deleteTransactionUseCase.execute({
      id,
    });

    return res.json(user);
  }
}

export { DeleteTransactionController };
