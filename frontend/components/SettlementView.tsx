import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Settlement } from "~backend/expense/types";
import { ArrowRight, CheckCircle, ArrowRightLeft, ChevronDown, ChevronRight, User, Sparkles, Info } from "lucide-react";

interface MemberSettlement {
  memberId: number;
  memberName: string;
  settlements: Settlement[];
  totalAmount: number;
}

export function SettlementView() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      const response = await backend.expense.getSettlements();
      setSettlements(response.settlements);
    } catch (error) {
      console.error("Failed to load settlements:", error);
      toast({
        title: "Error",
        description: "Failed to load settlements",
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
    }).format(amount);
  };

  const toggleMemberExpansion = (memberId: number) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  // Group settlements by member who needs to pay
  const memberSettlements: MemberSettlement[] = settlements.reduce((acc, settlement) => {
    const existingMember = acc.find(m => m.memberId === settlement.fromMemberId);
    if (existingMember) {
      existingMember.settlements.push(settlement);
      existingMember.totalAmount += settlement.amount;
    } else {
      acc.push({
        memberId: settlement.fromMemberId,
        memberName: settlement.fromMemberName,
        settlements: [settlement],
        totalAmount: settlement.amount,
      });
    }
    return acc;
  }, [] as MemberSettlement[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-600 text-lg">Loading settlements...</div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            All settled up!
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Everyone is even. No settlements needed. Your group is perfectly balanced!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Suggested Settlements</h2>
        <Badge variant="secondary" className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-medium">
          {memberSettlements.length} member{memberSettlements.length !== 1 ? "s" : ""} need to pay
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-2 text-lg">
                How to settle up
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Click on each member below to see their required payments. These are the minimum number of transactions needed to settle all debts optimally.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {memberSettlements.map((memberSettlement) => {
          const isExpanded = expandedMembers.has(memberSettlement.memberId);
          
          return (
            <Card key={memberSettlement.memberId} className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                {/* Member header - clickable to expand */}
                <Button
                  variant="ghost"
                  onClick={() => toggleMemberExpansion(memberSettlement.memberId)}
                  className="w-full p-6 justify-between hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {memberSettlement.memberName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-800 text-lg">
                        {memberSettlement.memberName}
                      </div>
                      <div className="text-sm text-slate-600">
                        {memberSettlement.settlements.length} payment{memberSettlement.settlements.length !== 1 ? "s" : ""} to make
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(memberSettlement.totalAmount)}
                      </div>
                      <div className="text-sm text-slate-600">total to pay</div>
                    </div>
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </Button>

                {/* Expanded settlements */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="p-6 space-y-4">
                      {memberSettlement.settlements.map((settlement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-600">Pay</span>
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">
                                  {settlement.toMemberName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-800 text-lg">
                                {settlement.toMemberName}
                              </span>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-slate-800">
                            {formatCurrency(settlement.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-2 text-lg">
                After settlements
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Once all these payments are made, everyone will be settled up and all balances will be zero. Your group will be perfectly even!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
