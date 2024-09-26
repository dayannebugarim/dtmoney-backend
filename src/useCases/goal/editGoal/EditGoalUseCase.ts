/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Goal from "../../../models/Goal";
import { AppError } from "../../../errors/AppError";

interface EditGoalRequest {
  id: string;
  name?: string;
  description?: string;
  value?: number;
  endDate?: Date;
}

interface GoalData extends Omit<EditGoalRequest, "id"> {}

export type MongoGoal = Omit<Goal, "id">;

class EditGoalUseCase {
  async execute({ id, name, description, value, endDate }: EditGoalRequest) {
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

      const data: GoalData = {};

      if (name) {
        data.name = name;
      }

      if (description) {
        data.description = description;
      }

      if (value) {
        data.value = +value;
      }

      if (endDate) {
        data.endDate = new Date(endDate);
      }

      const { modifiedCount } = await MongoClient.db
        .collection<MongoGoal>("goals")
        .updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: data,
          }
        );

      if (!modifiedCount) {
        throw new AppError("The goal was not updated");
      }

      return {
        message: "The goal was updated successfully",
      };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { EditGoalUseCase };
