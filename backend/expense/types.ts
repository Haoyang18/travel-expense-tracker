export interface Member {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  payerId: number;
  payerName: string;
  createdAt: Date;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: number;
  expenseId: number;
  memberId: number;
  memberName: string;
  amount: number;
}

export interface Balance {
  memberId: number;
  memberName: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

export interface Settlement {
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amount: number;
}
