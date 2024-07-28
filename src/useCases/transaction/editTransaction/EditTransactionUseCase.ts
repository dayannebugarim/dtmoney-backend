import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";

interface EditTransactionRequest {
  id: string;
  date?: string;
  value?: number;
  description?: string;
  type?: "Income" | "Expense";
  categoryId?: string;
  goalId?: string;
}

interface TransactionData extends Omit<EditTransactionRequest, "id" | "date"> {
  date?: Date;
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
    if (!id) {
      throw new Error("Required value 'id' is missing");
    }

    const transaction = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (type && type !== "Income" && type !== "Expense") {
      throw new Error("Transaction type is invalid");
    }

    const data: TransactionData = {};

    if (categoryId) {
      const category = await MongoClient.db
        .collection<MongoCategory>("categories")
        .findOne({ _id: new ObjectId(categoryId) });

      if (!category) {
        throw new Error("Category not found");
      }

      if (category.userId !== transaction.userId) {
        throw new Error(
          "The user is not allowed to set this category for the transaction"
        );
      }

      data.categoryId = categoryId;
    }

    if (goalId) {
      const goal = await MongoClient.db
        .collection<MongoGoal>("goals")
        .findOne({ _id: new ObjectId(goalId) });

      if (!goal) {
        throw new Error("Goal not found");
      }

      if (goal.userId !== transaction.userId) {
        throw new Error(
          "The user is not allowed to set this goal for the transaction"
        );
      }

      data.goalId = goalId;
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
      throw new Error("The transaction was not updated");
    }

    return {
      message: "The transaction was updated successfully",
    };
  }
}

export { EditTransactionUseCase };
