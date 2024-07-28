import { Request, Response } from "express";
import { SearchTransactionUseCase } from "./SearchTransactionUseCase";

class SearchTransactionController {
  async handle(req: Request, res: Response) {
    const { userId, description, type, categoryId, goalId, page, pageSize } =
      req.query;

    const serachTransactionUseCase = new SearchTransactionUseCase();

    const user = await serachTransactionUseCase.execute({
      userId: userId?.toString() || "",
      description: description?.toString(),
      type: type?.toString(),
      categoryId: categoryId?.toString(),
      goalId: goalId?.toString(),
      page: page ? +page : 1,
      pageSize: pageSize ? +pageSize : 10,
    });

    return res.json(user);
  }
}

export { SearchTransactionController };
