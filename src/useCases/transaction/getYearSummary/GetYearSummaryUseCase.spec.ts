/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetYearSummaryUseCase } from "./GetYearSummaryUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";
import { startOfYear, endOfToday, eachDayOfInterval, format } from "date-fns";

jest.mock("../../../database/MongoClient");

describe("GetYearSummaryUseCase", () => {
  let getYearSummaryUseCase: GetYearSummaryUseCase;

  beforeEach(() => {
    getYearSummaryUseCase = new GetYearSummaryUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        aggregate: jest.fn().mockReturnValue({ toArray: jest.fn() }),
      }),
    };
  });

  it("should return the correct year summary for a user", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
    };

    const mockTransactions = [
      {
        date: "2024-01-01",
        totalIncome: 1000,
        totalExpense: 500,
        total: 500,
      },
      {
        date: "2024-01-02",
        totalIncome: 1500,
        totalExpense: 700,
        total: 800,
      },
    ];

    const startOfYearDate = startOfYear(new Date());
    const endOfTodayDate = endOfToday();

    const daysOfYear = eachDayOfInterval({
      start: startOfYearDate,
      end: endOfTodayDate,
    }).map((date) => format(date, "yyyy-MM-dd"));

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce(mockTransactions);

    const response = await getYearSummaryUseCase.execute({
      userId: mockUser._id.toHexString(),
    });

    const expectedResult = daysOfYear.map((date) => {
      const dayData = mockTransactions.find((t) => t.date === date);
      return (
        dayData || {
          date,
          totalIncome: 0,
          totalExpense: 0,
          total: 0,
        }
      );
    });

    expect(response).toEqual(expectedResult);

    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(MongoClient.db.collection("transactions").findOne).toHaveBeenCalledWith({
      _id: mockUser._id,
    });

    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
    expect(MongoClient.db.collection("transactions").aggregate).toHaveBeenCalledWith([
      {
        $match: {
          userId: mockUser._id,
          date: { $gte: startOfYearDate, $lte: endOfTodayDate },
        },
      },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "America/Fortaleza" } } },
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
          date: "$_id.date",
          totalIncome: 1,
          totalExpense: 1,
          total: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },
      { $sort: { date: 1 } },
    ]);
  });

  it("should return empty summary for days with no transactions", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
    };

    const startOfYearDate = startOfYear(new Date());
    const endOfTodayDate = endOfToday();

    const daysOfYear = eachDayOfInterval({
      start: startOfYearDate,
      end: endOfTodayDate,
    }).map((date) => format(date, "yyyy-MM-dd"));

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("transactions").aggregate().toArray as jest.Mock).mockResolvedValueOnce([]);

    const response = await getYearSummaryUseCase.execute({
      userId: mockUser._id.toHexString(),
    });

    const expectedResult = daysOfYear.map((date) => ({
      date,
      totalIncome: 0,
      totalExpense: 0,
      total: 0,
    }));

    expect(response).toEqual(expectedResult);
  });

  it("should throw an error if the user is not found", async () => {
    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      getYearSummaryUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("User not found"));
  });

  it("should throw an error if the userId is missing", async () => {
    await expect(
      getYearSummaryUseCase.execute({
        userId: null,
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      getYearSummaryUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
