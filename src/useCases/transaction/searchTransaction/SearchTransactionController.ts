import { NextFunction, Request, Response } from "express";
import { SearchTransactionUseCase } from "./SearchTransactionUseCase";

class SearchTransactionController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, description, type, categoryId, goalId, page, pageSize } =
        req.query;

      const serachTransactionUseCase = new SearchTransactionUseCase();

      const user = await serachTransactionUseCase.execute({
        userId: userId?.toString() || null,
        description: description?.toString(),
        type: type?.toString(),
        categoryId: categoryId?.toString(),
        goalId: goalId?.toString(),
        page: page ? +page : 1,
        pageSize: pageSize ? +pageSize : 10,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { SearchTransactionController };
