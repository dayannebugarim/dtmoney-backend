import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import Category from "../../../models/Category";
import User from "../../../models/User";

interface ListCategoriesRequest {
  userId: string | null;
}

export type MongoUser = Omit<User, "id" | "password">;
export type MongoCategory = Omit<Category, "id">;

class ListCategoriesUseCase {
  async execute({ userId }: ListCategoriesRequest) {
    if (!userId) {
      throw new Error("Required value is missing");
    }

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const categories = MongoClient.db
      .collection<MongoCategory>("categories")
      .find({ userId });

    const results = await categories.toArray();

    const transformedResults = results.map(category => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, userId, ...rest } = category;
      return { id: _id, ...rest };
    });

    return transformedResults;
  }
}

export { ListCategoriesUseCase };
