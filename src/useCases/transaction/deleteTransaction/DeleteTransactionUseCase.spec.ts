/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteTransactionUseCase } from "./DeleteTransactionUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../database/MongoClient");

describe("DeleteTransactionUseCase", () => {
  let deleteTransactionUseCase: DeleteTransactionUseCase;

  beforeEach(() => {
    deleteTransactionUseCase = new DeleteTransactionUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        deleteOne: jest.fn(),
      }),
    };
  });

  it("should delete a transaction successfully", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
    };

    (
      MongoClient.db.collection("transactions").findOne as jest.Mock
    ).mockResolvedValueOnce(mockTransaction);

    (
      MongoClient.db.collection("transactions").deleteOne as jest.Mock
    ).mockResolvedValueOnce({
      deletedCount: 1,
    });

    const response = await deleteTransactionUseCase.execute({
      id: mockTransaction._id.toHexString(),
    });

    expect(response).toEqual({
      message: "The transaction was deleted successfully",
    });

    expect(MongoClient.db.collection).toHaveBeenCalledWith("transactions");
    expect(
      MongoClient.db.collection("transactions").deleteOne
    ).toHaveBeenCalledWith({
      _id: mockTransaction._id,
    });
  });

  it("should throw an error if required value 'id' is missing", async () => {
    await expect(
      deleteTransactionUseCase.execute({
        id: "",
      })
    ).rejects.toEqual(new AppError("Required value 'id' is missing"));
  });

  it("should throw an error if the transaction is not found", async () => {
    (
      MongoClient.db.collection("transactions").findOne as jest.Mock
    ).mockResolvedValueOnce(null);

    await expect(
      deleteTransactionUseCase.execute({
        id: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Transaction not found"));
  });

  it("should throw an error if the transaction is not deleted", async () => {
    const mockTransaction = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      value: 100,
      type: "Income",
    };

    (
      MongoClient.db.collection("transactions").findOne as jest.Mock
    ).mockResolvedValueOnce(mockTransaction);

    (
      MongoClient.db.collection("transactions").deleteOne as jest.Mock
    ).mockResolvedValueOnce({
      deletedCount: 0,
    });

    await expect(
      deleteTransactionUseCase.execute({
        id: mockTransaction._id.toHexString(),
      })
    ).rejects.toEqual(new AppError("The transaction was not deleted"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      deleteTransactionUseCase.execute({
        id: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
