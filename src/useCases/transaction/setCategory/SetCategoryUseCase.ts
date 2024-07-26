import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Category from "../../../models/Category";
import Transaction from "../../../models/Transaction";

interface SetCategoryRequest {
  categoryId: string;
  transactionId: string;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoCategory = Omit<Category, "id">;

class SetCategoryUseCase {
  async execute({ categoryId, transactionId }: SetCategoryRequest) {
    if (!categoryId || !transactionId) {
      throw new Error("Required value is missing");
    }

    const transaction = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .findOne({ _id: new ObjectId(transactionId) });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const category = await MongoClient.db
      .collection<MongoCategory>("categories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!category) {
      throw new Error("Category not found");
    }

    if (transaction.userId !== category.userId) {
      throw new Error(
        "The user is not allowed to set this category for the transaction"
      );
    }

    const { modifiedCount } = await MongoClient.db
      .collection<MongoTransaction>("transactions")
      .updateOne(
        {
          _id: new ObjectId(transactionId),
        },
        {
          $set: {
            categoryId,
          },
        }
      );

    if (!modifiedCount) {
      throw new Error("Category not set for transaction");
    }

    return { message: `Category '${category.name}' was successfully set for the transaction` };
  }
}

export { SetCategoryUseCase };
