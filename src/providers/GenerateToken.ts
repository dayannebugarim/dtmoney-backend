import RefreshToken from "../models/RefreshToken";
import { sign } from "jsonwebtoken";

export type MongoRefreshToken = Omit<RefreshToken, "id">;

class GenerateToken {
  async execute(userId: string, name: string, email: string) {
    const token = sign({ id: userId, name, email }, `${process.env.SECRET}`, {
      subject: `${userId}`,
      expiresIn: "20m",
    });

    return token;
  }
}

export { GenerateToken };
