import { NextFunction, Request, Response } from "express";
import { SetCategoryUseCase } from "./SetCategoryUseCase";

class SetCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, transactionId } = await req.body;

      const setCategoryUseCase = new SetCategoryUseCase();

      const user = await setCategoryUseCase.execute({
        categoryId,
        transactionId,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { SetCategoryController };
