import { ObjectId } from "mongodb";
import { MongoClient } from "../../database/MongoClient";
import User from "../../models/User";

export type MongoUser = Omit<User, "id">;

class GetUserUseCase {
  async execute(id: string) {
    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new Error("User not found");
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}

export { GetUserUseCase };
