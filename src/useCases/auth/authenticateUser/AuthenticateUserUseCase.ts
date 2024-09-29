/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient } from "../../../database/MongoClient";
import User from "../../../models/User";
import { compare } from "bcryptjs";
import { GenerateRefreshToken } from "../../../providers/GenerateRefreshToken";
import { GenerateToken } from "../../../providers/GenerateToken";
import RefreshToken from "../../../models/RefreshToken";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoRefreshToken = Omit<RefreshToken, "id">;

class AuthenticateUserUseCase {
  async execute({ email, password }: AuthenticateUserRequest) {
    try {
      const userExists = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ email });

      if (!userExists) {
        throw new AppError("Email ou senha incorreto.");
      }

      const passwordMatch = await compare(password, userExists.password);

      if (!passwordMatch) {
        throw new AppError("Email ou senha incorreto.");
      }

      const generateToken = new GenerateToken();
      const token = await generateToken.execute(
        `${userExists._id}`,
        userExists.name,
        userExists.email
      );

      await MongoClient.db
        .collection<MongoRefreshToken>("refresh_token")
        .deleteMany({
          userId: new ObjectId(userExists._id),
        });

      const generateRefreshToken = new GenerateRefreshToken();
      const refreshToken = await generateRefreshToken.execute(userExists._id);

      return { token, refreshToken };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { AuthenticateUserUseCase };
