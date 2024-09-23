import dayjs from "dayjs";
import { MongoClient } from "../database/MongoClient";
import RefreshToken from "../models/RefreshToken";
import { ObjectId } from "mongodb";

export type MongoRefreshToken = Omit<RefreshToken, "id">;

class GenerateRefreshToken {
  async execute(userId: ObjectId) {
    const expiresIn = dayjs().add(7, "days").unix();

    const { insertedId } = await MongoClient.db
      .collection<MongoRefreshToken>("refresh_token")
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
