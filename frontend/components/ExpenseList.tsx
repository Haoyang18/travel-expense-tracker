import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Expense, Member } from "~backend/expense/types";
import { Receipt, User, Users, Trash2, TrendingUp, Calendar, CreditCard } from "lucide-react";

interface ExpenseListProps {
  onExpenseDeleted?: () => void;
}

export function ExpenseList({ onExpenseDeleted }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesResponse, membersResponse] = await Promise.all([
        backend.expense.listExpenses(),
        backend.expense.listMembers()
      ]);
      setExpenses(expensesResponse.expenses);
      setMembers(membersResponse.members);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    setDeletingId(expenseId);
    try {
      await backend.expense.deleteExpense({ id: expenseId });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      loadData();
      onExpenseDeleted?.();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-600 text-lg">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Members</p>
                <p className="text-4xl font-bold mb-1">{members.length}</p>
                <p className="text-blue-200 text-xs">Active participants</p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Total Expenses</p>
                <p className="text-4xl font-bold mb-1">{expenses.length}</p>
                <p className="text-emerald-200 text-xs">Recorded transactions</p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Receipt className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Amount</p>
                <p className="text-4xl font-bold mb-1">{formatCurrency(getTotalAmount())}</p>
                <p className="text-purple-200 text-xs">Group spending</p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              No expenses yet
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Add your first expense to get started tracking shared costs with your travel group.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-800">All Expenses</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="grid gap-6">
            {expenses.map((expense) => (
              <Card key={expense.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteExpense(expense.id)}
                  disabled={deletingId === expense.id}
                  className="absolute top-4 right-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CardHeader className="pb-4 pr-20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-800 mb-2">
                        {expense.description}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Paid by <span className="font-medium text-slate-800">{expense.payerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(expense.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-800">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Users className="w-4 h-4" />
                      Split between {expense.splits.length} member{expense.splits.length !== 1 ? "s" : ""}:
                    </div>
                    <div className="grid gap-3">
                      {expense.splits.map((split) => (
                        <div
                          key={split.id}
                          className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {split.memberName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-slate-800">{split.memberName}</span>
                          </div>
                          <span className="font-bold text-slate-800 text-lg">
                            {formatCurrency(split.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
