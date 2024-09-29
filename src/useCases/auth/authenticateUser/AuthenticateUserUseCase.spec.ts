/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { compare } from "bcryptjs";
import { GenerateToken } from "../../../providers/GenerateToken";
import { GenerateRefreshToken } from "../../../providers/GenerateRefreshToken";
import { AppError } from "../../../errors/AppError";
import { ObjectId } from "mongodb";

jest.mock("../../../database/MongoClient");
jest.mock("bcryptjs");
jest.mock("../../../providers/GenerateToken");
jest.mock("../../../providers/GenerateRefreshToken");

describe("AuthenticateUserUseCase", () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    authenticateUserUseCase = new AuthenticateUserUseCase();

    (MongoClient as any).db = {
      collection: jest.fn(),
    };
  });

  it("should authenticate user with valid credentials", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockUser),
      deleteMany: jest.fn().mockResolvedValue({}),
    });

    (compare as jest.Mock).mockResolvedValue(true);

    const mockToken = "validToken";
    const mockRefreshToken = "validRefreshToken";
    (GenerateToken.prototype.execute as jest.Mock).mockResolvedValue(mockToken);
    (GenerateRefreshToken.prototype.execute as jest.Mock).mockResolvedValue(
      mockRefreshToken
    );

    const response = await authenticateUserUseCase.execute({
      email: "test@example.com",
      password: "password123",
    });

    expect(response).toHaveProperty("token", mockToken);
    expect(response).toHaveProperty("refreshToken", mockRefreshToken);
    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(GenerateToken.prototype.execute).toHaveBeenCalledWith(
      `${mockUser._id}`,
      mockUser.name,
      mockUser.email
    );
  });

  it("should throw an error if user does not exist", async () => {
    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "nonexistent@example.com",
        password: "password123",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorreto."));
  });

  it("should throw an error if password does not match", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockUser),
    });

    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authenticateUserUseCase.execute({
        email: "test@example.com",
        password: "wrongpassword",
      })
    ).rejects.toEqual(new AppError("Email ou senha incorreto."));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
