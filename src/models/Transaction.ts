export default interface Transaction {
  id: string;
  userId: string;
  date: Date;
  value: number;
  description: string;
  type: 'Income' | 'Expense';
  categoryId?: string;
  goalId?: string;
}
