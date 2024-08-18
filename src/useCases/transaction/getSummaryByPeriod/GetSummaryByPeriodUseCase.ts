import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";

interface GetSummaryByPeriodRequest {
  userId: string | null;
}

export type MongoUser = Omit<User, "id">;
export type MongoTransaction = Omit<Transaction, "id">;

class GetSummaryByPeriodUseCase {
  async execute({ userId }: GetSummaryByPeriodRequest) {
    if (!userId) {
      throw new Error("Required value is missing");
    }

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const pipeline = [
      {
        $match: { userId: new ObjectId(userId) },
      },
      {
        $facet: {
          weekly: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  week: { $week: "$date" },
                },
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
                year: "$_id.year",
                week: "$_id.week",
                totalIncome: 1,
                totalExpense: 1,
                total: { $subtract: ["$totalIncome", "$totalExpense"] },
              },
            },
            { $sort: { year: 1, week: 1 } },
          ],
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                },
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
                year: "$_id.year",
                month: "$_id.month",
                totalIncome: 1,
                totalExpense: 1,
                total: { $subtract: ["$totalIncome", "$totalExpense"] },
              },
            },
            { $sort: { year: 1, month: 1 } },
          ],
          yearly: [
            {
              $group: {
                _id: { year: { $year: "$date" } },
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
                year: "$_id.year",
                totalIncome: 1,
                totalExpense: 1,
                total: { $subtract: ["$totalIncome", "$totalExpense"] },
              },
            },
            { $sort: { year: 1 } },
          ],
        },
      },
    ];

    const result = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .aggregate(pipeline)
      .toArray();

    return result.length > 0
      ? result[0]
      : { weekly: [], monthly: [], yearly: [] };
  }
}

export { GetSummaryByPeriodUseCase };
