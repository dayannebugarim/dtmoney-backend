import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Transaction from "../../../models/Transaction";
import Category from "../../../models/Category";
import Goal from "../../../models/Goal";

interface DeleteTransactionRequest {
  id: string;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;
export type MongoGoal = Omit<Goal, "id">;

class DeleteTransactionUseCase {
  async execute({
    id,
  }: DeleteTransactionRequest) {
    if (!id) {
      throw new Error("Required value 'id' is missing");
    }

    const transaction = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const { deletedCount } = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .deleteOne(
        {
          _id: new ObjectId(id),
        }
      );

    if (!deletedCount) {
      throw new Error("The transaction was not deleted");
    }

    return {
      message: "The transaction was deleted successfully",
    };
  }
}

export { DeleteTransactionUseCase };
