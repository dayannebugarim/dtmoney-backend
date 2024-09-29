import { NextFunction, Request, Response } from "express";
import { CreateCategoryUseCase } from "./CreateCategoryUseCase";

class CreateCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, name } = await req.body;

      const createCategoryUseCase = new CreateCategoryUseCase();

      const user = await createCategoryUseCase.execute({
        userId,
        name,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateCategoryController };
