import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Member } from "~backend/expense/types";
import { Plus, Minus, Users, Calculator, UserCheck, Sparkles, DollarSign } from "lucide-react";

interface AddExpenseProps {
  onExpenseAdded: () => void;
}

export function AddExpense({ onExpenseAdded }: AddExpenseProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [customSplits, setCustomSplits] = useState<{ memberId: number; amount: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await backend.expense.listMembers();
      setMembers(response.members);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    }
  };

  const handleEqualSplit = async () => {
    if (!description.trim() || !amount || !payerId || selectedMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await backend.expense.addEqualExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        payerId: parseInt(payerId),
        memberIds: selectedMembers,
      });

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      // Reset form
      setDescription("");
      setAmount("");
      setPayerId("");
      setSelectedMembers([]);
      onExpenseAdded();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSplit = async () => {
    if (!description.trim() || !amount || !payerId || customSplits.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const splits = customSplits
      .filter(split => split.amount && parseFloat(split.amount) > 0)
      .map(split => ({
        memberId: split.memberId,
        amount: parseFloat(split.amount),
      }));

    if (splits.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one split",
        variant: "destructive",
      });
      return;
    }

    const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
    const expenseAmount = parseFloat(amount);
    
    if (Math.abs(totalSplits - expenseAmount) > 0.01) {
      toast({
        title: "Error",
        description: `Splits must sum to the total amount. Current total: £${totalSplits.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await backend.expense.addExpense({
        description: description.trim(),
        amount: expenseAmount,
        payerId: parseInt(payerId),
        splits,
      });

      toast({
        title: "Success",
        description: "Expense added successfully",
      });

      // Reset form
      setDescription("");
      setAmount("");
      setPayerId("");
      setCustomSplits([]);
      onExpenseAdded();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomSplit = () => {
    if (members.length > 0) {
      setCustomSplits([...customSplits, { memberId: members[0].id, amount: "" }]);
    }
  };

  const removeCustomSplit = (index: number) => {
    setCustomSplits(customSplits.filter((_, i) => i !== index));
  };

  const updateCustomSplit = (index: number, field: "memberId" | "amount", value: string) => {
    const updated = [...customSplits];
    if (field === "memberId") {
      updated[index].memberId = parseInt(value);
    } else {
      updated[index].amount = value;
    }
    setCustomSplits(updated);
  };

  const calculateRemainingAmount = () => {
    const totalSplits = customSplits.reduce((sum, split) => {
      const splitAmount = parseFloat(split.amount) || 0;
      return sum + splitAmount;
    }, 0);
    const expenseAmount = parseFloat(amount) || 0;
    return expenseAmount - totalSplits;
  };

  const selectAllMembers = () => {
    setSelectedMembers(members.map(member => member.id));
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const isAllMembersSelected = selectedMembers.length === members.length && members.length > 0;

  if (members.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            No members yet
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Add some members first before creating expenses. Head over to the Members tab to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic expense info */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What was this expense for? (e.g., Dinner at Italian restaurant)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 mb-2 block">
                Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payer" className="text-sm font-semibold text-slate-700 mb-2 block">
                Who paid?
              </Label>
              <Select value={payerId} onValueChange={setPayerId}>
                <SelectTrigger className="border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()} className="rounded-lg">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Split options */}
        <Tabs defaultValue="equal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
            <TabsTrigger 
              value="equal" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Users className="w-4 h-4" />
              Equal Split
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Calculator className="w-4 h-4" />
              Custom Split
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equal" className="space-y-6 mt-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold text-slate-700">Split equally between:</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isAllMembersSelected ? deselectAllMembers : selectAllMembers}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-lg"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isAllMembersSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid gap-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers([...selectedMembers, member.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                        }
                      }}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label htmlFor={`member-${member.id}`} className="font-medium text-slate-700 cursor-pointer">
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {selectedMembers.length > 0 && amount && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="text-sm text-emerald-800">
                  Each person owes: <span className="font-bold text-lg">
                    £{(parseFloat(amount) / selectedMembers.length).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleEqualSplit} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Adding..." : "Add Equal Split Expense"}
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700">Custom splits:</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSplit}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Split
                </Button>
              </div>

              {customSplits.map((split, index) => (
                <div key={index} className="flex gap-3 items-center p-3 rounded-xl border border-slate-200">
                  <Select
                    value={split.memberId.toString()}
                    onValueChange={(value) => updateCustomSplit(index, "memberId", value)}
                  >
                    <SelectTrigger className="flex-1 border-slate-200 focus:border-emerald-400 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()} className="rounded-lg">
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={split.amount}
                      onChange={(e) => updateCustomSplit(index, "amount", e.target.value)}
                      className="w-32 pl-9 border-slate-200 focus:border-emerald-400 rounded-lg"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomSplit(index)}
                    className="text-red-500 border-red-200 hover:bg-red-50 rounded-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {customSplits.length > 0 && amount && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-800">
                  Remaining amount: <span className={`font-bold text-lg ${
                    Math.abs(calculateRemainingAmount()) < 0.01 ? "text-emerald-600" : "text-red-500"
                  }`}>
                    £{calculateRemainingAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleCustomSplit} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Adding..." : "Add Custom Split Expense"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
