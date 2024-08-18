import { Request, Response } from "express";
import { GetSummaryUseCase } from "./GetSummaryUseCase";

class GetSummaryController {
  async handle(req: Request, res: Response) {
    const { userId } = req.params;

    const getSummaryUseCase = new GetSummaryUseCase();

    const user = await getSummaryUseCase.execute({
      userId,
    });

    return res.json(user);
  }
}

export { GetSummaryController };
