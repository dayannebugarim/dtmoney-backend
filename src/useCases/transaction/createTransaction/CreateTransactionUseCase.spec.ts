/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateTransactionUseCase } from "./CreateTransactionUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";
import Transaction from "../../../models/Transaction";

jest.mock("../../../database/MongoClient");

describe("CreateTransactionUseCase", () => {
  let createTransactionUseCase: CreateTransactionUseCase;

  beforeEach(() => {
    createTransactionUseCase = new CreateTransactionUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        insertOne: jest.fn(),
      }),
    };
  });

  it("should create a new transaction successfully", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
      description: "Test transaction",
      date: new Date(),
    };

    const mockUser = {
      _id: mockTransaction.userId,
      name: "Test User",
      email: "test@example.com",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").insertOne as jest.Mock).mockResolvedValueOnce({
      insertedId: mockTransaction._id,
    });

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(mockTransaction);

    const response = await createTransactionUseCase.execute({
      userId: mockTransaction.userId.toHexString(),
      value: mockTransaction.value,
      type: mockTransaction.type as Transaction["type"],
      description: mockTransaction.description,
    });

    expect(response).toHaveProperty("id", mockTransaction._id.toHexString());
    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
  });

  it("should throw an error if required value is missing", async () => {
    await expect(
      createTransactionUseCase.execute({
        userId: "",
        value: 0,
        type: "" as any,
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw an error if user is not found", async () => {
    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      createTransactionUseCase.execute({
        userId: new ObjectId().toHexString(),
        value: 100,
        type: "Expense",
      })
    ).rejects.toEqual(new AppError("User not found"));
  });

  it("should throw an error if transaction type is invalid", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    await expect(
      createTransactionUseCase.execute({
        userId: mockUser._id.toHexString(),
        value: 100,
        type: "InvalidType" as any,
      })
    ).rejects.toEqual(new AppError("Transaction type is invalid"));
  });

  it("should throw an error if category is not found", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("categories").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      createTransactionUseCase.execute({
        userId: mockUser._id.toHexString(),
        value: 100,
        type: "Expense",
        categoryId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Category not found"));
  });

  it("should throw an error if goal is not found", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("goals").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      createTransactionUseCase.execute({
        userId: mockUser._id.toHexString(),
        value: 100,
        type: "Expense",
        goalId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Goal not found"));
  });

  it("should throw an error if transaction creation fails", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").insertOne as jest.Mock).mockResolvedValueOnce({
      insertedId: new ObjectId(),
    });

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      createTransactionUseCase.execute({
        userId: mockUser._id.toHexString(),
        value: 100,
        type: "Income",
      })
    ).rejects.toEqual(new AppError("Transaction not created."));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      createTransactionUseCase.execute({
        userId: new ObjectId().toHexString(),
        value: 100,
        type: "Income",
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
