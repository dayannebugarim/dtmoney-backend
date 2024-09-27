import { Request, Response } from "express";
import { GetYearSummaryUseCase } from "./GetYearSummaryUseCase";

class GetYearSummaryController {
  async handle(req: Request, res: Response) {
    const { userId } = req.params;

    const getYearSummaryUseCase = new GetYearSummaryUseCase();

    const user = await getYearSummaryUseCase.execute({
      userId,
    });

    return res.json(user);
  }
}

export { GetYearSummaryController };
