import { Request, Response } from "express";
import { GetSummaryByPeriodUseCase } from "./GetSummaryByPeriodUseCase";

class GetSummaryByPeriodController {
  async handle(req: Request, res: Response) {
    const { userId } = req.params;

    const getSummaryByPeriodUseCase = new GetSummaryByPeriodUseCase();

    const user = await getSummaryByPeriodUseCase.execute({
      userId,
    });

    return res.json(user);
  }
}

export { GetSummaryByPeriodController };
