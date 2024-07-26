import { Request, Response } from "express";
import { CreateCategoryUseCase } from "./CreateCategoryUseCase";

class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const { userId, name } =
      await req.body;

    const createCategoryUseCase = new CreateCategoryUseCase();

    const user = await createCategoryUseCase.execute({
      userId,
      name,
    });

    return res.json(user);
  }
}

export { CreateCategoryController };
