import { Request, Response } from "express";
import { RefreshTokenUserUseCase } from "./RefreshTokenUserUseCase";

class RefreshTokenUserController {
  async handle(req: Request, res: Response) {
    const { refresh_token } = await req.body;

    const refreshTokenUserUseCase = new RefreshTokenUserUseCase();

    const token = await refreshTokenUserUseCase.execute({ refresh_token });

    return res.json(token);
  }
}

export { RefreshTokenUserController };
