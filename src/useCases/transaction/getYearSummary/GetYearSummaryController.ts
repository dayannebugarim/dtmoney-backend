import { NextFunction, Request, Response } from "express";
import { GetYearSummaryUseCase } from "./GetYearSummaryUseCase";

class GetYearSummaryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const getYearSummaryUseCase = new GetYearSummaryUseCase();

      const user = await getYearSummaryUseCase.execute({
        userId,
      });

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export { GetYearSummaryController };
