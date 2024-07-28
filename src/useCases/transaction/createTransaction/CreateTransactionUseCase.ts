import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";

interface CreateTransactionRequest {
  userId: string;
  value: number;
  description?: string;
  type: "Income" | "Expense";
  categoryId?: string;
  goalId?: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;
export type MongoGoal = Omit<Goal, "id">;

class CreateTransactionUseCase {
  async execute({
    userId,
    value,
    description,
    type,
    categoryId,
    goalId,
  }: CreateTransactionRequest) {
    if (!userId || !value || !type) {
      throw new Error("Required value is missing");
    }

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    if (type !== "Income" && type !== "Expense") {
      throw new Error("Transaction type is invalid");
    }

    const data: MongoTransaction = {
      userId: new ObjectId(userId),
      date: new Date(),
      value,
      type,
      description,
    }

    if (categoryId) {
      const category = await MongoClient.db
        .collection<MongoCategory>("categories")
        .findOne({ _id: new ObjectId(categoryId) });
  
      if (!category) {
        throw new Error("Category not found");
      }

      if (category.userId.toHexString() !== userId) {
        throw new Error("The user is not allowed to set this category for the transaction");
      }

      data.categoryId = new ObjectId(categoryId)
    }

    if (goalId) {
      const goal = await MongoClient.db
      .collection<MongoGoal>("goals")
      .findOne({ _id: new ObjectId(goalId) });
  
      if (!goal) {
        throw new Error("Goal not found");
      }
  
      if (goal.userId.toHexString() !== userId) {
        throw new Error("The user is not allowed to set this goal for the transaction");
      }

      data.goalId = new ObjectId(goalId)
    }

    const { insertedId } = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .insertOne(data);

    const transaction = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .findOne({ _id: insertedId });

    if (!transaction) {
      throw new Error("Transaction not created.");
    }

    const { _id } = transaction;

    return { id: _id.toHexString() };
  }
}

export { CreateTransactionUseCase };
