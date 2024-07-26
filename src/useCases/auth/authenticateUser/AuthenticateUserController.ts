import { Request, Response } from "express";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

class AuthenticateUserController {
  async handle(req: Request, res: Response) {
    const { email, password } = await req.body;

    const authenticateUserUseCase = new AuthenticateUserUseCase();

    const token = await authenticateUserUseCase.execute({
      email,
      password,
    });

    return res.json(token);
  }
}

export { AuthenticateUserController }