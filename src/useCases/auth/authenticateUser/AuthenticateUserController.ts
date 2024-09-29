import { NextFunction, Request, Response } from "express";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

class AuthenticateUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = await req.body;

      const authenticateUserUseCase = new AuthenticateUserUseCase();

      const token = await authenticateUserUseCase.execute({
        email,
        password,
      });

      return res.json(token);
    } catch (error) {
      next(error);
    }
  }
}

export { AuthenticateUserController };
