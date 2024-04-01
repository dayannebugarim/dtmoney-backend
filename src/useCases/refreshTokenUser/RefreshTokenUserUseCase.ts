import dayjs from "dayjs";
import { MongoClient } from "../../database/MongoClient";
import RefreshToken from "../../models/RefreshToken";
import { GenerateToken } from "../../providers/GenerateToken";
import { ObjectId } from "mongodb";
import { GenerateRefreshToken } from "../../providers/GenerateRefreshToken";

interface RefreshTokenUserRequest {
  refresh_token: string;
}

export type MongoRefreshToken = Omit<RefreshToken, "id">;

class RefreshTokenUserUseCase {
  async execute({ refresh_token }: RefreshTokenUserRequest) {
    const refreshToken = await MongoClient.db
      .collection<MongoRefreshToken>("refresh_token")
      .findOne({ _id: new ObjectId(refresh_token) });

    if (!refreshToken) {
      throw new Error("Refresh token invalid.");
    }

    const refreshTokenExpired = dayjs().isAfter(
      dayjs.unix(refreshToken.expiresIn)
    );

    const generateToken = new GenerateToken();
    const token = await generateToken.execute(refreshToken.userId);

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
  }
}

export { RefreshTokenUserUseCase };
