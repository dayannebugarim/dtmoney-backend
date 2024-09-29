/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateUserUseCase } from "./CreateUserUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { AppError } from "../../../errors/AppError";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

jest.mock("../../../database/MongoClient");
jest.mock("bcryptjs");

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    createUserUseCase = new CreateUserUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        insertOne: jest.fn(),
      }),
    };
  });

  it("should create a new user successfully", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(null);

    (
      MongoClient.db.collection("users").insertOne as jest.Mock
    ).mockResolvedValueOnce({
      insertedId: mockUser._id,
    });

    (bcrypt.hash as jest.Mock).mockResolvedValue(mockUser.password);

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(mockUser);

    const response = await createUserUseCase.execute({
      name: mockUser.name,
      email: mockUser.email,
      password: "password123",
    });

    expect(response).toHaveProperty("id", mockUser._id.toHexString());
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
  });

  it("should throw an error if the email is already in use", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(mockUser);

    await expect(
      createUserUseCase.execute({
        name: "Another User",
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toEqual(new AppError("O email já está em uso."));
  });

  it("should throw an error if the user creation fails", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    };

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(null);
    (
      MongoClient.db.collection("users").insertOne as jest.Mock
    ).mockResolvedValueOnce({
      insertedId: mockUser._id,
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockUser.password);

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(null);

    await expect(
      createUserUseCase.execute({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toEqual(new AppError("Erro ao criar usuário."));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      createUserUseCase.execute({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
