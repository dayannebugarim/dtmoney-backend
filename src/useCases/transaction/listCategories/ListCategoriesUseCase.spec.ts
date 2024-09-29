/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListCategoriesUseCase } from "./ListCategoriesUseCase";
import { MongoClient } from "../../../database/MongoClient";
import { ObjectId } from "mongodb";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../database/MongoClient");

describe("ListCategoriesUseCase", () => {
  let listCategoriesUseCase: ListCategoriesUseCase;

  beforeEach(() => {
    listCategoriesUseCase = new ListCategoriesUseCase();

    jest.clearAllMocks();

    (MongoClient as any).db = {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn(),
        }),
      }),
    };
  });

  it("should return a list of categories for a user", async () => {
    const mockUser = {
      _id: new ObjectId(),
      name: "Test User",
    };

    const mockCategories = [
      {
        _id: new ObjectId(),
        name: "Category 1",
        userId: mockUser._id,
        type: "Expense",
      },
      {
        _id: new ObjectId(),
        name: "Category 2",
        userId: mockUser._id,
        type: "Income",
      },
    ];

    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(mockUser);

    (MongoClient.db.collection("categories").find().toArray as jest.Mock).mockResolvedValueOnce(mockCategories);

    const response = await listCategoriesUseCase.execute({
      userId: mockUser._id.toHexString(),
    });

    const expectedResult = mockCategories.map((category) => ({
      id: category._id,
      name: category.name,
      type: category.type,
    }));

    expect(response).toEqual(expectedResult);

    expect(MongoClient.db.collection).toHaveBeenCalledWith("users");
    expect(MongoClient.db.collection("categories").findOne).toHaveBeenCalledWith({
      _id: mockUser._id,
    });

    expect(MongoClient.db.collection).toHaveBeenCalledWith("categories");
    expect(MongoClient.db.collection("categories").find).toHaveBeenCalledWith({
      userId: mockUser._id,
    });
  });

  it("should throw an error if the user is not found", async () => {
    (MongoClient.db.collection("users").findOne as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      listCategoriesUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("User not found"));
  });

  it("should throw an error if the userId is missing", async () => {
    await expect(
      listCategoriesUseCase.execute({
        userId: null,
      })
    ).rejects.toEqual(new AppError("Required value is missing"));
  });

  it("should throw a generic error if an unknown error occurs", async () => {
    (MongoClient.db.collection as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    await expect(
      listCategoriesUseCase.execute({
        userId: new ObjectId().toHexString(),
      })
    ).rejects.toEqual(new AppError("Unexpected error", 500));
  });
});
