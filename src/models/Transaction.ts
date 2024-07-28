import { ObjectId } from "mongodb";

export default interface Transaction {
  id: string;
  userId: ObjectId;
  date: Date;
  value: number;
  description?: string;
  type: 'Income' | 'Expense';
  categoryId?: ObjectId;
  goalId?: ObjectId;
}
