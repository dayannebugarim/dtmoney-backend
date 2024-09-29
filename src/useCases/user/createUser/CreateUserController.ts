import { NextFunction, Request, Response } from "express";
import { CreateUserUseCase } from "./CreateUserUseCase";

class CreateUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = await req.body;

      const createUserUseCase = new CreateUserUseCase();

      const user = await createUserUseCase.execute({
        name,
        email,
        password,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateUserController };
