export default interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  value: number;
  createdAt: Date;
  endDate: Date;
}
