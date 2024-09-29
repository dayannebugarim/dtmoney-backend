/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateCategoryUseCase } from "./CreateCategoryUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { AppError } from "../../../errors/AppError";
import { ObjectId } from "mongodb";

jest.mock("../../../database/MongoClient");

describe("CreateCategoryUseCase", () => {
  let createCategoryUseCase: CreateCategoryUseCase;

  beforeEach(() => {
    createCategoryUseCase = new CreateCategoryUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        insertOne: jest.fn(),
      }),
    };
  });

  it("should create a new category successfully", async () => {
    const mockCategory = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      name: "Test Category",
    };

    const mockUser = {
      _id: mockCategory.userId,
      name: "Test User",
      email: "test@example.com",
    };

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(mockUser);

    (
      MongoClient.db.collection("categories").insertOne as jest.Mock
    ).mockResolvedValueOnce({
      insertedId: mockCategory._id,
    });

    (
      MongoClient.db.collection("categories").findOne as jest.Mock
    ).mockResolvedValueOnce(mockCategory);

    const response = await createCategoryUseCase.execute({
      userId: mockCategory.userId.toHexString(),
      name: mockCategory.name,
    });

    expect(response).toHaveProperty("id", mockCategory._id.toHexString());
    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(MongoClient.db.collection).toHaveBeenCalledWith("categories");
  });

  it("should throw an error if required value is missing", async () => {
    await expect(
      createCategoryUseCase.execute({
        userId: "",
        name: "",
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw an error if user is not found", async () => {
    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(null);

    await expect(
      createCategoryUseCase.execute({
        userId: new ObjectId().toHexString(),
        name: "Test Category",
      })
    ).rejects.toEqual(new AppError("User not found"));
  });

  it("should throw an error if category creation fails", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
      email: "test@example.com",
    };

    (
      MongoClient.db.collection("users").findOne as jest.Mock
    ).mockResolvedValueOnce(mockUser);

    (
      MongoClient.db.collection("categories").insertOne as jest.Mock
    ).mockResolvedValueOnce({
      insertedId: new ObjectId(),
    });

    (
      MongoClient.db.collection("categories").findOne as jest.Mock
    ).mockResolvedValueOnce(null);

    await expect(
      createCategoryUseCase.execute({
        userId: mockUser._id.toHexString(),
        name: "Test Category",
      })
    ).rejects.toEqual(new AppError("Category not created."));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      createCategoryUseCase.execute({
        userId: new ObjectId().toHexString(),
        name: "Test Category",
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
