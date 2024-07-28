import { ObjectId } from "mongodb";

export default interface Goal {
  id: string;
  userId: ObjectId;
  name: string;
  description?: string;
  value: number;
  createdAt: Date;
  endDate: Date;
}
