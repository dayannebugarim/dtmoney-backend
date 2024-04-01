import dayjs from "dayjs";
import { MongoClient } from "../database/MongoClient";
import RefreshToken from "../models/RefreshToken";

export type MongoRefreshToken = Omit<RefreshToken, "id">;

class GenerateRefreshToken {
  async execute(userId: string) {
    const expiresIn = dayjs().add(15, "second").unix();

    const { insertedId } = await MongoClient.db
      .collection("refresh_token")
      .insertOne({
        userId,
        expiresIn,
      });

    const refreshToken = await MongoClient.db
      .collection<MongoRefreshToken>("refresh_token")
      .findOne({ _id: insertedId });

    if (!refreshToken) {
      throw new Error("Refresh token not created.");
    }

    const { _id, ...rest } = refreshToken;

    return { id: _id.toHexString(), ...rest };
  }
}

export { GenerateRefreshToken };
