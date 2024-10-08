/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Goal from "../../../models/Goal";
import { AppError } from "../../../errors/AppError";

interface ListGoalsRequest {
  userId: string | null;
}

export type MongoUser = Omit<User, "id">;
export type MongoGoal = Omit<Goal, "id">;

class ListGoalsUseCase {
  async execute({ userId }: ListGoalsRequest) {
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
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "goalId",
            as: "transactions",
          },
        },
        {
          $unwind: {
            path: "$transactions",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            goalValue: { $first: "$value" },
            totalIncome: {
              $sum: {
                $cond: [
                  { $eq: ["$transactions.type", "Income"] },
                  "$transactions.value",
                  {
                    $cond: [
                      { $eq: ["$transactions.type", "Expense"] },
                      { $multiply: ["$transactions.value", -1] },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            goalValue: 1,
            totalIncome: 1,
          },
        },
      ];

      const results = await MongoClient.db
        .collection<MongoGoal>("goals")
        .aggregate(pipeline)
        .toArray();

      return results;
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { ListGoalsUseCase };
