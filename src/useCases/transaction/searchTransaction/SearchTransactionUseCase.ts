/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

interface SearchTransactionRequest {
  userId: string | null;
  description?: string;
  type?: string;
  categoryId?: string;
  goalId?: string;
  page?: number;
  pageSize?: number;
}

interface DescriptionOptions {
  $regex: string;
  $options: string;
}

interface SearchTransactionQuery {
  userId: ObjectId;
  categoryId?: ObjectId;
  description?: DescriptionOptions;
  type?: "Income" | "Expense";
  goalId?: ObjectId;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;
export type MongoGoal = Omit<Goal, "id">;

class SearchTransactionUseCase {
  async execute({
    userId,
    description,
    type,
    categoryId,
    goalId,
    page = 1,
    pageSize = 10,
  }: SearchTransactionRequest) {
    try {
      if (!userId) {
        throw new AppError("Required value is missing");
      }

      const query: SearchTransactionQuery = {
        userId: new ObjectId(userId),
      };

      if (description) {
        query.description = { $regex: description, $options: "i" };
      }

      if (type && type !== "Income" && type !== "Expense") {
        throw new AppError("Transaction type is invalid");
      }

      if (type) {
        query.type = type as Transaction["type"];
      }

      if (categoryId) {
        query.categoryId = new ObjectId(categoryId);
      }

      if (goalId) {
        query.goalId = new ObjectId(goalId);
      }

      const skip = (page - 1) * pageSize;

      const transactionsCursor = MongoClient.db
        .collection<MongoTransaction>("transactions")
        .aggregate([
          { $match: query },
          { $skip: skip },
          { $limit: pageSize },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "goals",
              localField: "goalId",
              foreignField: "_id",
              as: "goalInfo",
            },
          },
          {
            $unwind: {
              path: "$goalInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              userId: 1,
              description: 1,
              type: 1,
              value: 1,
              date: 1,
              categoryId: 1,
              "categoryInfo.name": 1,
              goalId: 1,
              "goalInfo.name": 1,
              createdAt: 1,
            },
          },
        ]);

      const results = await transactionsCursor.toArray();

      const transformedResults = results.map((transaction) => {
        const { _id, categoryInfo = {}, goalInfo = {} } = transaction;

        return {
          id: _id,
          category: {
            id: transaction.categoryId || null,
            name: categoryInfo.name || null,
          },
          goal: {
            id: transaction.goalId || null,
            name: goalInfo.name || null,
          },
          date: transaction.date,
          value: transaction.value,
          type: transaction.type,
          description: transaction.description,
        };
      });

      return transformedResults;
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { SearchTransactionUseCase };
