import { NextFunction, Request, Response } from "express";
import { GetSummaryUseCase } from "./GetSummaryUseCase";

class GetSummaryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const getSummaryUseCase = new GetSummaryUseCase();

      const user = await getSummaryUseCase.execute({
        userId,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { GetSummaryController };
