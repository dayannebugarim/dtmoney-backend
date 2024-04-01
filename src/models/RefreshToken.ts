import User from "./User";

export default interface RefreshToken {
  id: string;
  expiresIn: number;
  user: User;
  userId: string;
}
