/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import User from "../../../models/User";
import Category from "../../../models/Category";
import { AppError } from "../../../errors/AppError";

interface CreateCategoryRequest {
  userId: string;
  name: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoCategory = Omit<Category, "id">;

class CreateCategoryUseCase {
  async execute({ userId, name }: CreateCategoryRequest) {
    try {
      if (!userId || !name) {
        throw new AppError("Required value is missing");
      }

      const user = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        throw new AppError("User not found");
      }

      const { insertedId } = await MongoClient.db
        .collection<MongoCategory>("categories")
        .insertOne({
          userId: new ObjectId(userId),
          name,
        });

      const category = await MongoClient.db
        .collection<MongoCategory>("categories")
        .findOne({ _id: insertedId });

      if (!category) {
        throw new AppError("Category not created.");
      }

      const { _id } = category;

      return { id: _id.toHexString() };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { CreateCategoryUseCase };
