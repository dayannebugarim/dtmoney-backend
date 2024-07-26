import { Request, Response } from "express";
import { GetUserUseCase } from "./GetUserUseCase";

class GetUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const getUserUseCase = new GetUserUseCase();

    const user = await getUserUseCase.execute(id);

    return res.json(user);
  }
}

export { GetUserController };
