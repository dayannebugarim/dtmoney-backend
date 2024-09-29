/* eslint-disable @typescript-eslint/no-explicit-any */
import { RefreshTokenUserUseCase } from "./RefreshTokenUserUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { GenerateToken } from "../../../providers/GenerateToken";
import { GenerateRefreshToken } from "../../../providers/GenerateRefreshToken";
import { AppError } from "../../../errors/AppError";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";

jest.mock("../../../database/MongoClient");
jest.mock("../../../providers/GenerateToken");
jest.mock("../../../providers/GenerateRefreshToken");

describe("RefreshTokenUserUseCase", () => {
  let refreshTokenUserUseCase: RefreshTokenUserUseCase;

  beforeEach(() => {
    refreshTokenUserUseCase = new RefreshTokenUserUseCase();

    (MongoClient as any).db = {
      collection: jest.fn(),
    };
  });

  it("should refresh the token when the refresh token is valid and not expired", async () => {
    const mockRefreshToken = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      expiresIn: dayjs().add(1, "day").unix(),
    };

    const mockUser = {
      _id: mockRefreshToken.userId,
      name: "Test User",
      email: "test@example.com",
    };

    const mockToken = "validToken";

    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest
        .fn()
        .mockResolvedValueOnce(mockRefreshToken)
        .mockResolvedValueOnce(mockUser),
      deleteMany: jest.fn(),
    });

    (GenerateToken.prototype.execute as jest.Mock).mockResolvedValue(mockToken);

    const response = await refreshTokenUserUseCase.execute({
      refresh_token: mockRefreshToken._id.toHexString(),
    });

    expect(response).toHaveProperty("token", mockToken);
    expect(response).not.toHaveProperty("refreshToken");
  });

  it("should generate a new refresh token if the old one is expired", async () => {
    const mockRefreshToken = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      expiresIn: dayjs().subtract(1, "day").unix(),
    };

    const mockUser = {
      _id: mockRefreshToken.userId,
      name: "Test User",
      email: "test@example.com",
    };

    const mockToken = "validToken";
    const newRefreshToken = "newValidRefreshToken";

    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest
        .fn()
        .mockResolvedValueOnce(mockRefreshToken)
        .mockResolvedValueOnce(mockUser),
      deleteMany: jest.fn(),
    });

    (GenerateToken.prototype.execute as jest.Mock).mockResolvedValue(mockToken);
    (GenerateRefreshToken.prototype.execute as jest.Mock).mockResolvedValue(
      newRefreshToken
    );

    const response = await refreshTokenUserUseCase.execute({
      refresh_token: mockRefreshToken._id.toHexString(),
    });

    expect(response).toHaveProperty("token", mockToken);
    expect(response).toHaveProperty("refreshToken", newRefreshToken);
  });

  it("should throw an error if the refresh token is invalid", async () => {
    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await expect(
      refreshTokenUserUseCase.execute({
        refresh_token: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Refresh token invalid."));
  });

  it("should throw an error if the user associated with the refresh token is not found", async () => {
    const mockRefreshToken = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      expiresIn: dayjs().add(1, "day").unix(),
    };

    (MongoClient.db.collection as jest.Mock).mockReturnValue({
      findOne: jest
        .fn()
        .mockResolvedValueOnce(mockRefreshToken)
        .mockResolvedValueOnce(null),
    });

    await expect(
      refreshTokenUserUseCase.execute({
        refresh_token: mockRefreshToken._id.toHexString(),
      })
    ).rejects.toEqual(new AppError("User not found."));
  });

  it("should throw a generic error if an unexpected error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      refreshTokenUserUseCase.execute({
        refresh_token: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
