/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetSummaryUseCase } from "./GetSummaryUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../database/MongoClient");

describe("GetSummaryUseCase", () => {
  let getSummaryUseCase: GetSummaryUseCase;

  beforeEach(() => {
    getSummaryUseCase = new GetSummaryUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        aggregate: jest.fn().mockReturnValue({ toArray: jest.fn() }),
      }),
    };
  });

  it("should return the correct summary for a user", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
    };

    const mockSummary = [
      {
        totalIncome: 1000,
        totalExpense: 500,
        total: 500,
      },
    ];

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce(mockSummary);

    const response = await getSummaryUseCase.execute({
      userId: mockUser._id.toHexString(),
    });

    expect(response).toEqual(mockSummary[0]);

    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(MongoClient.db.collection("transactions").findOne).toHaveBeenCalledWith({
      _id: mockUser._id,
    });

    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
    expect(MongoClient.db.collection("transactions").aggregate).toHaveBeenCalledWith([
      {
        $match: { userId: mockUser._id },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "Income"] }, "$value", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "Expense"] }, "$value", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          total: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },
    ]);
  });

  it("should return a default summary if no transactions are found", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
    };

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce([]);

    const response = await getSummaryUseCase.execute({
      userId: mockUser._id.toHexString(),
    });

    expect(response).toEqual({
      totalIncome: 0,
      totalExpense: 0,
      total: 0,
    });
  });

  it("should throw an error if the user is not found", async () => {
    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      getSummaryUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("User not found"));
  });

  it("should throw an error if the userId is missing", async () => {
    await expect(
      getSummaryUseCase.execute({
        userId: null,
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      getSummaryUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
