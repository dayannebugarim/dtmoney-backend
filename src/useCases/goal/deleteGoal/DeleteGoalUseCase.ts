/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Goal from "../../../models/Goal";
import Transaction from "../../../models/Transaction";
import { AppError } from "../../../errors/AppError";

interface DeleteGoalRequest {
  id: string;
}

export type MongoTransaction = Omit<Transaction, "id">;
export type MongoGoal = Omit<Goal, "id">;

class DeleteGoalUseCase {
  async execute({ id }: DeleteGoalRequest) {
    try {
      if (!id) {
        throw new AppError("Required value 'id' is missing");
      }

      const goal = await MongoClient.db
        .collection<MongoGoal>("goals")
        .findOne({ _id: new ObjectId(id) });

      if (!goal) {
        throw new AppError("Goal not found");
      }

      const session = MongoClient.client.startSession();

      await session.withTransaction(
        async () => {
          const deleteGoalResult = await MongoClient.db
            .collection<MongoGoal>("goals")
            .deleteOne({ _id: new ObjectId(id) }, { session });

          if (deleteGoalResult.deletedCount === 0) {
            throw new AppError(`Failed to delete goal with id: ${id}`);
          }

          const deleteTransactionsResult = await MongoClient.db
            .collection<MongoTransaction>("transactions")
            .deleteMany({ goalId: new ObjectId(id) }, { session });
          console.log(
            `Deleted ${deleteTransactionsResult.deletedCount} transactions associated with goal id: ${id}`
          );
        },
        {
          readConcern: { level: "local" },
          writeConcern: { w: "majority" },
          readPreference: "primary",
        }
      );

      return {
        message: "The goal was deleted successfully",
      };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { DeleteGoalUseCase };
