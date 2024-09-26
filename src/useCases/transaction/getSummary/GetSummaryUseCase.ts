/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";
import { AppError } from "../../../errors/AppError";

interface GetSummaryRequest {
  userId: string | null;
}

export type MongoUser = Omit<User, "id">;
export type MongoTransaction = Omit<Transaction, "id">;

class GetSummaryUseCase {
  async execute({ userId }: GetSummaryRequest) {
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

      const pipeline = [
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $group: {
            _id: null,
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
            totalIncome: 1,
            totalExpense: 1,
            total: { $subtract: ["$totalIncome", "$totalExpense"] },
          },
        },
      ];

      const result = await MongoClient.db
        .collection<MongoTransaction>("transactions")
        .aggregate(pipeline)
        .toArray();

      return result.length > 0
        ? result[0]
        : { totalIncome: 0, totalExpense: 0, total: 0 };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { GetSummaryUseCase };
