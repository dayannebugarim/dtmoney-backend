import { NextFunction, Request, Response } from "express";
import { GetUserUseCase } from "./GetUserUseCase";

class GetUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const getUserUseCase = new GetUserUseCase();

      const user = await getUserUseCase.execute(id);

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { GetUserController };
