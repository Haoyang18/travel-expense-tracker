import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Balance } from "~backend/expense/types";
import { TrendingUp, TrendingDown, Minus, Calculator, DollarSign, CreditCard, ArrowDownLeft } from "lucide-react";

export function BalanceView() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    try {
      const response = await backend.expense.getBalances();
      setBalances(response.balances);
    } catch (error) {
      console.error("Failed to load balances:", error);
      toast({
        title: "Error",
        description: "Failed to load balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(Math.abs(amount));
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 0.01) {
      return { 
        type: "owed", 
        label: "is owed", 
        color: "text-emerald-600", 
        bgColor: "from-emerald-500 to-teal-500",
        icon: TrendingUp 
      };
    } else if (balance < -0.01) {
      return { 
        type: "owes", 
        label: "owes", 
        color: "text-red-500", 
        bgColor: "from-red-500 to-rose-500",
        icon: TrendingDown 
      };
    } else {
      return { 
        type: "even", 
        label: "is even", 
        color: "text-blue-600", 
        bgColor: "from-blue-500 to-indigo-500",
        icon: Minus 
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-600 text-lg">Loading balances...</div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            No balances to show
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Add some members and expenses to see balance calculations and who owes what.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Member Balances</h2>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
          {balances.length} member{balances.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-6">
        {balances.map((balance) => {
          const status = getBalanceStatus(balance.balance);
          const StatusIcon = status.icon;
          const isPositiveBalance = balance.balance > 0.01;

          return (
            <Card key={balance.memberId} className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${status.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <StatusIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {balance.memberName}
                      </h3>
                      <p className={`text-sm font-medium ${status.color}`}>
                        {status.label} {formatCurrency(balance.balance)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${status.color}`}>
                      {status.type === "owes" ? "-" : status.type === "owed" ? "+" : ""}
                      {formatCurrency(balance.balance)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">Total Paid</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-800">
                      {formatCurrency(balance.totalPaid)}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      {isPositiveBalance ? (
                        <>
                          <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Should Receive</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Total Owed</span>
                        </>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {formatCurrency(isPositiveBalance ? balance.balance : balance.totalOwed)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
