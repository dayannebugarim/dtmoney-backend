/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchTransactionUseCase } from "./SearchTransactionUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../database/MongoClient");

describe("SearchTransactionUseCase", () => {
  let searchTransactionUseCase: SearchTransactionUseCase;

  beforeEach(() => {
    searchTransactionUseCase = new SearchTransactionUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        countDocuments: jest.fn(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn(),
        }),
      }),
    };
  });

  it("should return a list of transactions for a user with pagination", async () => {
    const mockUserId = new ObjectId().toHexString();

    const mockTransactions = [
      {
        _id: new ObjectId(),
        description: "Test transaction 1",
        type: "Income",
        value: 100,
        date: new Date(),
        categoryId: new ObjectId(),
        goalId: new ObjectId(),
        categoryInfo: { name: "Category 1" },
        goalInfo: { name: "Goal 1" },
      },
      {
        _id: new ObjectId(),
        description: "Test transaction 2",
        type: "Expense",
        value: 50,
        date: new Date(),
        categoryId: new ObjectId(),
        goalId: new ObjectId(),
        categoryInfo: { name: "Category 2" },
        goalInfo: { name: "Goal 2" },
      },
    ];

    (MongoClient.db.collection("transactions").countDocuments as jest.Mock).mockResolvedValueOnce(2);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce(mockTransactions);

    const response = await searchTransactionUseCase.execute({
      userId: mockUserId,
      page: 1,
      pageSize: 10,
    });

    expect(response.transactions.length).toBe(2);
    expect(response.totalPages).toBe(1);

    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
    expect(MongoClient.db.collection("transactions").countDocuments).toHaveBeenCalledWith({
      userId: new ObjectId(mockUserId),
    });
    expect(MongoClient.db.collection("transactions").aggregate).toHaveBeenCalled();
  });

  it("should filter transactions by description, type, categoryId, and goalId", async () => {
    const mockUserId = new ObjectId().toHexString();
    const mockCategoryId = new ObjectId().toHexString();
    const mockGoalId = new ObjectId().toHexString();
    const mockDescription = "test";

    const mockTransactions = [
      {
        _id: new ObjectId(),
        description: "Test transaction 1",
        type: "Income",
        value: 100,
        date: new Date(),
        categoryId: new ObjectId(),
        goalId: new ObjectId(),
        categoryInfo: { name: "Category 1" },
        goalInfo: { name: "Goal 1" },
      },
    ];

    (MongoClient.db.collection("transactions").countDocuments as jest.Mock).mockResolvedValueOnce(1);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce(mockTransactions);

    const response = await searchTransactionUseCase.execute({
      userId: mockUserId,
      description: mockDescription,
      type: "Income",
      categoryId: mockCategoryId,
      goalId: mockGoalId,
      page: 1,
      pageSize: 10,
    });

    expect(response.transactions.length).toBe(1);
    expect(response.totalPages).toBe(1);

    expect(MongoClient.db.collection("transactions").countDocuments).toHaveBeenCalledWith({
      userId: new ObjectId(mockUserId),
      description: { $regex: mockDescription, $options: "i" },
      type: "Income",
      categoryId: new ObjectId(mockCategoryId),
      goalId: new ObjectId(mockGoalId),
    });
    expect(MongoClient.db.collection("transactions").aggregate).toHaveBeenCalled();
  });

  it("should throw an error if the userId is missing", async () => {
    await expect(
      searchTransactionUseCase.execute({
        userId: null,
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw an error if the transaction type is invalid", async () => {
    await expect(
      searchTransactionUseCase.execute({
        userId: new ObjectId().toHexString(),
        type: "InvalidType",
      })
    ).rejects.toEqual(new AppError("Transaction type is invalid"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      searchTransactionUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
