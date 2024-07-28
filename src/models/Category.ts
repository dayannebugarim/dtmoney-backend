import { ObjectId } from "mongodb";

export default interface Category {
  id: string;
  userId: ObjectId;
  name: string;
}
