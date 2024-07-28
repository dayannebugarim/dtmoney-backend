import { Request, Response } from "express";
import { ListCategoriesUseCase } from "./ListCategoriesUseCase";

class ListCategoriesController {
  async handle(req: Request, res: Response) {
    const { userId } = req.query;

    const listCategoriesUseCase = new ListCategoriesUseCase();

    const user = await listCategoriesUseCase.execute({
      userId: userId?.toString() || null,
    });

    return res.json(user);
  }
}

export { ListCategoriesController };
