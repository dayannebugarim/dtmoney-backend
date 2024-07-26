import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Category from "../../../models/Category";

interface CreateCategoryRequest {
  userId: string;
  name: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoCategory = Omit<Category, "id">;

class CreateCategoryUseCase {
  async execute({
    userId,
    name,
  }: CreateCategoryRequest) {
    if (!userId || !name) {
      throw new Error("Required value is missing");
    }

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const { insertedId } = await MongoClient.db
      .collection<MongoCategory>("categories")
      .insertOne({
        userId,
        name,
      });

    const category = await MongoClient.db
      .collection<MongoCategory>("categories")
      .findOne({ _id: insertedId });

    if (!category) {
      throw new Error("Category not created.");
    }

    const { _id } = category;

    return { id: _id.toHexString() };
  }
}

export { CreateCategoryUseCase };
