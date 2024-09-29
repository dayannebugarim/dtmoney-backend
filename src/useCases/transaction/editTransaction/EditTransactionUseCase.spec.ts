/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditTransactionUseCase } from "./EditTransactionUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../database/MongoClient");

describe("EditTransactionUseCase", () => {
  let editTransactionUseCase: EditTransactionUseCase;

  beforeEach(() => {
    editTransactionUseCase = new EditTransactionUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        updateOne: jest.fn(),
      }),
    };
  });

  it("should update the transaction successfully", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
      description: "Test description",
      date: new Date(),
    };

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(mockTransaction);

    (MongoClient.db.collection("transactions").updateOne as jest.Mock).mockResolvedValueOnce({
      modifiedCount: 1,
    });

    const response = await editTransactionUseCase.execute({
      id: mockTransaction._id.toHexString(),
      value: 200,
      description: "Updated description",
    });

    expect(response).toEqual({
      message: "The transaction was updated successfully",
    });

    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
    expect(MongoClient.db.collection("transactions").updateOne).toHaveBeenCalledWith(
      { _id: mockTransaction._id },
      { $set: { value: 200, description: "Updated description" } }
    );
  });

  it("should throw an error if the transaction is not found", async () => {
    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      editTransactionUseCase.execute({
        id: new ObjectId().toHexString(),
        value: 200,
      })
    ).rejects.toEqual(new AppError("Transaction not found"));
  });

  it("should throw an error if required value 'id' is missing", async () => {
    await expect(
      editTransactionUseCase.execute({
        id: "",
        value: 200,
      })
    ).rejects.toEqual(new AppError("Required value 'id' is missing"));
  });

  it("should throw an error if the transaction type is invalid", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
    };

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(mockTransaction);

    await expect(
      editTransactionUseCase.execute({
        id: mockTransaction._id.toHexString(),
        type: "InvalidType" as "Income" | "Expense",
      })
    ).rejects.toEqual(new AppError("Transaction type is invalid"));
  });

  it("should throw an error if the category is not found", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
    };

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(mockTransaction);

    (MongoClient.db.collection("categories").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      editTransactionUseCase.execute({
        id: mockTransaction._id.toHexString(),
        categoryId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Category not found"));
  });

  it("should throw an error if the goal is not found", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
    };

    (MongoClient.db.collection("transactions").findOne as jest.Mock).mockResolvedValueOnce(mockTransaction);

    (MongoClient.db.collection("goals").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      editTransactionUseCase.execute({
        id: mockTransaction._id.toHexString(),
        goalId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Goal not found"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      editTransactionUseCase.execute({
        id: new ObjectId().toHexString(),
        value: 200,
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
