import { MongoClient } from "../../../database/MongoClient";
import User from "../../../models/User";
import { compare } from "bcryptjs";
import { GenerateRefreshToken } from "../../../providers/GenerateRefreshToken";
import { GenerateToken } from "../../../providers/GenerateToken";
import RefreshToken from "../../../models/RefreshToken";

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export type MongoUser = Omit<User, "id">;
export type MongoRefreshToken = Omit<RefreshToken, "id">;

class AuthenticateUserUseCase {
  async execute({ email, password }: AuthenticateUserRequest) {
    const userExists = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ email });

    if (!userExists) {
      throw new Error("Email or password incorrect.");
    }

    const passwordMatch = await compare(password, userExists.password);

    if (!passwordMatch) {
      throw new Error("Email or password incorrect.");
    }

    const generateToken = new GenerateToken();
    const token = await generateToken.execute(`${userExists._id}`);

    await MongoClient.db
      .collection<MongoRefreshToken>("refresh_token")
      .deleteMany({
        userId: `${userExists._id}`,
      });

    const generateRefreshToken = new GenerateRefreshToken();
    const refreshToken = await generateRefreshToken.execute(
      `${userExists._id}`
    );

    return { token, refreshToken };
  }
}

export { AuthenticateUserUseCase };
