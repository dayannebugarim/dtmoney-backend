import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Goal from "../../../models/Goal";

interface GetGoalRequest {
  id: string | null;
}

export type MongoGoal = Omit<Goal, "id">;

class GetGoalUseCase {
  async execute({ id }: GetGoalRequest) {
    if (!id) {
      throw new Error("Required value is missing");
    }

    const goal = await MongoClient.db
      .collection<MongoGoal>("goals")
      .findOne({ _id: new ObjectId(id) });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const pipeline = [
      {
        $match: { _id: new ObjectId(id) },
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
          userId: { $first: "$userId" },
          name: { $first: "$name" },
          description: { $first: "$description" },
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
          createdAt: { $first: "$createdAt" },
          endDate: { $first: "$endDate" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          userId: 1,
          name: 1,
          description: 1,
          goalValue: 1,
          totalIncome: 1,
          createdAt: 1,
          endDate: 1,
        },
      },
    ];

    const result = await MongoClient.db
      .collection<MongoGoal>("goals")
      .aggregate(pipeline)
      .toArray();

    return result.length > 0 ? result[0] : null;
  }
}

export { GetGoalUseCase };
