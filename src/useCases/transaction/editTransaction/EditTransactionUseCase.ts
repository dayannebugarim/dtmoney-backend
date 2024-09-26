/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";
import { AppError } from "../../../errors/AppError";

interface EditTransactionRequest {
  id: string;
  date?: string;
  value?: number;
  description?: string;
  type?: "Income" | "Expense";
  categoryId?: string;
  goalId?: string;
}

interface TransactionData {
  date?: Date;
  value?: number;
  description?: string;
  type?: "Income" | "Expense";
  categoryId?: ObjectId;
  goalId?: ObjectId;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;
export type MongoGoal = Omit<Goal, "id">;

class EditTransactionUseCase {
  async execute({
    id,
    date,
    value,
    description,
    type,
    categoryId,
    goalId,
  }: EditTransactionRequest) {
    try {
      if (!id) {
        throw new AppError("Required value 'id' is missing");
      }

      const transaction = await MongoClient.db
        .collection<MongoTransaction>("transactions")
        .findOne({ _id: new ObjectId(id) });

      if (!transaction) {
        throw new AppError("Transaction not found");
      }

      if (type && type !== "Income" && type !== "Expense") {
        throw new AppError("Transaction type is invalid");
      }

      const data: TransactionData = {};

      if (categoryId) {
        const category = await MongoClient.db
          .collection<MongoCategory>("categories")
          .findOne({ _id: new ObjectId(categoryId) });

        if (!category) {
          throw new AppError("Category not found");
        }

        if (
          category.userId.toHexString() !== transaction.userId.toHexString()
        ) {
          throw new AppError(
            "The user is not allowed to set this category for the transaction"
          );
        }

        data.categoryId = new ObjectId(categoryId);
      }

      if (goalId) {
        const goal = await MongoClient.db
          .collection<MongoGoal>("goals")
          .findOne({ _id: new ObjectId(goalId) });

        if (!goal) {
          throw new AppError("Goal not found");
        }

        if (goal.userId.toHexString() !== transaction.userId.toHexString()) {
          throw new AppError(
            "The user is not allowed to set this goal for the transaction"
          );
        }

        data.goalId = new ObjectId(goalId);
      }

      if (date) {
        data.date = new Date(date);
      }

      if (value) {
        data.value = +value;
      }

      if (description) {
        data.description = description;
      }

      if (type) {
        data.type = type;
      }

      const { modifiedCount } = await MongoClient.db
        .collection<MongoTransaction>("transactions")
        .updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: data,
          }
        );

      if (!modifiedCount) {
        throw new AppError("The transaction was not updated");
      }

      return {
        message: "The transaction was updated successfully",
      };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { EditTransactionUseCase };
