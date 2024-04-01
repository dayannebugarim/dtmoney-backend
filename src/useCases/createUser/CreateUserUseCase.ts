import { MongoClient } from "../../database/MongoClient";
import User from "../../models/User";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export type MongoUser = Omit<User, "id">;

class CreateUserUseCase {
  async execute({ name, email, password }: CreateUserRequest) {
    const userExists = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ email });

    if (userExists) {
      throw new Error("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { insertedId } = await MongoClient.db
      .collection("users")
      .insertOne({ name, email, password: hashedPassword });

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: insertedId });

    if (!user) {
      throw new Error("User not created.");
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}

export { CreateUserUseCase };
