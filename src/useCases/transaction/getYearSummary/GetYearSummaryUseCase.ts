/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";
import { AppError } from "../../../errors/AppError";
import { startOfYear, endOfToday, eachDayOfInterval, format } from "date-fns";

interface GetYearSummaryRequest {
  userId: string | null;
}

export type MongoUser = Omit<User, "id">;
export type MongoTransaction = Omit<Transaction, "id">;

class GetYearSummaryUseCase {
  async execute({ userId }: GetYearSummaryRequest) {
    try {
      if (!userId) {
        throw new AppError("Required value is missing");
      }

      const user = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        throw new AppError("User not found");
      }

      const startOfYearDate = startOfYear(new Date());
      const endOfTodayDate = endOfToday();

      const daysOfYear = eachDayOfInterval({
        start: startOfYearDate,
        end: endOfTodayDate,
      }).map((date) => format(date, "yyyy-MM-dd"));

      const pipeline = [
        {
          $match: {
            userId: new ObjectId(userId),
            date: { $gte: startOfYearDate, $lte: endOfTodayDate },
          },
        },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "Income"] }, "$value", 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ["$type", "Expense"] }, "$value", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id.date",
            totalIncome: 1,
            totalExpense: 1,
            total: { $subtract: ["$totalIncome", "$totalExpense"] },
          },
        },
        { $sort: { date: 1 } },
      ];

      const transactions = await MongoClient.db
        .collection<MongoTransaction>("transactions")
        .aggregate(pipeline)
        .toArray();

      const result = daysOfYear.map((date) => {
        const dayData = transactions.find((t) => t.date === date);
        return dayData || {
          date,
          totalIncome: 0,
          totalExpense: 0,
          total: 0,
        };
      });

      return result;
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { GetYearSummaryUseCase };
