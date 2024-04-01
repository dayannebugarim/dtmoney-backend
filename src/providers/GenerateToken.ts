import RefreshToken from "../models/RefreshToken";
import { sign } from "jsonwebtoken";

export type MongoRefreshToken = Omit<RefreshToken, "id">;

class GenerateToken {
  async execute(userId: string) {
    const token = sign({}, `${process.env.SECRET}`, {
      subject: `${userId}`,
      expiresIn: "20s",
    });

    return token;
  }
}

export { GenerateToken };
