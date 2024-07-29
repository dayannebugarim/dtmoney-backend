import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Goal from "../../../models/Goal";

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
  async execute({
    id,
    name,
    description,
    value,
    endDate,
  }: EditGoalRequest) {
    if (!id) {
      throw new Error("Required value 'id' is missing");
    }

    const goal = await MongoClient.db
      .collection<MongoGoal>("goals")
      .findOne({ _id: new ObjectId(id) });

    if (!goal) {
      throw new Error("Goal not found");
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
      throw new Error("The goal was not updated");
    }

    return {
      message: "The goal was updated successfully",
    };
  }
}

export { EditGoalUseCase };
