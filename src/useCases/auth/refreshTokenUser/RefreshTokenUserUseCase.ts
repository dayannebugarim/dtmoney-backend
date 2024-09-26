/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { MongoClient } from "../../../database/MongoClient";
import RefreshToken from "../../../models/RefreshToken";
import { GenerateToken } from "../../../providers/GenerateToken";
import { ObjectId } from "mongodb";
import { GenerateRefreshToken } from "../../../providers/GenerateRefreshToken";
import User from "../../../models/User";
import { AppError } from "../../../errors/AppError";

interface RefreshTokenUserRequest {
  refresh_token: string;
}

export type MongoRefreshToken = Omit<RefreshToken, "id">;
export type MongoUser = Omit<User, "password">;

class RefreshTokenUserUseCase {
  async execute({ refresh_token }: RefreshTokenUserRequest) {
    try {
      const refreshToken = await MongoClient.db
        .collection<MongoRefreshToken>("refresh_token")
        .findOne({ _id: new ObjectId(refresh_token) });

      if (!refreshToken) {
        throw new AppError("Refresh token invalid.");
      }

      const refreshTokenExpired = dayjs().isAfter(
        dayjs.unix(refreshToken.expiresIn)
      );

      const userExists = await MongoClient.db
        .collection<MongoUser>("users")
        .findOne({ _id: refreshToken.userId });

      if (!userExists) {
        throw new AppError("User not found.");
      }

      const generateToken = new GenerateToken();
      const token = await generateToken.execute(
        refreshToken.userId.toHexString(),
        userExists.name,
        userExists.email
      );

      if (refreshTokenExpired) {
        await MongoClient.db
          .collection<MongoRefreshToken>("refresh_token")
          .deleteMany({
            userId: refreshToken.userId,
          });

        const generateRefreshToken = new GenerateRefreshToken();
        const newRefreshToken = await generateRefreshToken.execute(
          refreshToken.userId
        );

        return { token, refreshToken: newRefreshToken };
      }

      return { token };
    } catch (error: any) {
      if (!(error instanceof AppError)) {
        throw new AppError(error.message, 500);
      }

      throw error;
    }
  }
}

export { RefreshTokenUserUseCase };
