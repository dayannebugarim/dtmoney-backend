import { NextFunction, Request, Response } from "express";
import { ListCategoriesUseCase } from "./ListCategoriesUseCase";

class ListCategoriesController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query;

      const listCategoriesUseCase = new ListCategoriesUseCase();

      const user = await listCategoriesUseCase.execute({
        userId: userId?.toString() || null,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { ListCategoriesController };
