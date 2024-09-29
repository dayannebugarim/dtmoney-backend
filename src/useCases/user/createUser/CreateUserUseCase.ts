/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import { AppError } from "../../../errors/AppError";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export type MongoUser = Omit<User, "id">;

class CreateUserUseCase {
  async execute({ name, email, password }: CreateUserRequest) {
    try {
      const userExists = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ email });

      if (userExists) {
        throw new AppError("O email já está em uso.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { insertedId } = await MongoClient.db
        .collection("users")
        .insertOne({ name, email, password: hashedPassword });

      const user = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ _id: insertedId });

      if (!user) {
        throw new AppError("Erro ao criar usuário.");
      }

      const { _id } = user;

      return { id: _id.toHexString() };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { CreateUserUseCase };
