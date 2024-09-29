import { NextFunction, Request, Response } from "express";
import { RefreshTokenUserUseCase } from "./RefreshTokenUserUseCase";

class RefreshTokenUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = await req.body;

      const refreshTokenUserUseCase = new RefreshTokenUserUseCase();

      const token = await refreshTokenUserUseCase.execute({ refresh_token });

      return res.json(token);
    } catch (error) {
      next(error);
    }
  }
}

export { RefreshTokenUserController };
