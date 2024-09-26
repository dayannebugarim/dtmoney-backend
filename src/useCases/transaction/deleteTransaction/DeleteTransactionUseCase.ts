/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";
import { AppError } from "../../../errors/AppError";

interface DeleteTransactionRequest {
  id: string;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;
export type MongoGoal = Omit<Goal, "id">;

class DeleteTransactionUseCase {
  async execute({ id }: DeleteTransactionRequest) {
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

      const { deletedCount } = await MongoClient.db
        .collection<MongoTransaction>("transactions")
        .deleteOne({
          _id: new ObjectId(id),
        });

      if (!deletedCount) {
        throw new AppError("The transaction was not deleted");
      }

      return {
        message: "The transaction was deleted successfully",
      };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { DeleteTransactionUseCase };
