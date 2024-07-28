import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Goal from "../../../models/Goal";

interface CreateGoalRequest {
  userId: string;
  name: string;
  description?: string;
  value: number;
  endDate: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoGoal = Omit<Goal, "id">;

class CreateGoalUseCase {
  async execute({
    userId,
    name,
    description,
    value,
    endDate,
  }: CreateGoalRequest) {
    if (!userId || !name || !value || !endDate) {
      throw new Error("Required value is missing");
    }

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const { insertedId } = await MongoClient.db
      .collection<MongoGoal>("goals")
      .insertOne({
        userId: new ObjectId(userId),
        name,
        description,
        value: +value,
        createdAt: new Date(),
        endDate: new Date(endDate),
      });

    const goal = await MongoClient.db
      .collection<MongoGoal>("goals")
      .findOne({ _id: insertedId });

    if (!goal) {
      throw new Error("Goal not created.");
    }

    const { _id } = goal;

    return { id: _id.toHexString() };
  }
}

export { CreateGoalUseCase };
