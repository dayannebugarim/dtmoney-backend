import { MongoClient } from "../../../database/MongoClient";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";
import { ObjectId } from "mongodb";

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
    if (!userId) {
      throw new Error("Required value is missing");
    }

    const query: SearchTransactionQuery = {
      userId: new ObjectId(userId),
    };

    if (description) {
      query.description = { $regex: description, $options: "i" };
    }

    if (type && type !== "Income" && type !== "Expense") {
      throw new Error("Transaction type is invalid");
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
      .find(query)
      .skip(skip)
      .limit(pageSize);

    const results = await transactionsCursor.toArray();

    const transformedResults = results.map(category => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, userId, ...rest } = category;
      return { id: _id, ...rest };
    });

    return transformedResults;
  }
}

export { SearchTransactionUseCase };
