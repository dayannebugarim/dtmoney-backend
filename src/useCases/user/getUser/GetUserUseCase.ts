/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongodb";
import { MongoClient } from "../../../database/MongoClient";
import User from "../../../models/User";
import { AppError } from "../../../errors/AppError";

export type MongoUser = Omit<User, "id">;

class GetUserUseCase {
  async execute(id: string) {
    try {
      const user = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ _id: new ObjectId(id) });

      if (!user) {
        throw new AppError("User not found");
      }

      const { _id, ...rest } = user;

      return { id: _id.toHexString(), ...rest };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { GetUserUseCase };
