import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./components/ExpenseList";
import { AddExpense } from "./components/AddExpense";
import { MemberList } from "./components/MemberList";
import { BalanceView } from "./components/BalanceView";
import { SettlementView } from "./components/SettlementView";
import { Users, Receipt, Calculator, ArrowRightLeft, Plus, Sparkles } from "lucide-react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              TravelSplit
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Smart expense tracking for your travel adventures. Split costs effortlessly and settle up with style.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="expenses" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-5 bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-2xl p-2 h-auto">
              <TabsTrigger 
                value="expenses" 
                className="flex flex-col items-center gap-2 py-4 px-3 text-xs sm:flex-row sm:gap-3 sm:text-sm rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Receipt className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Expenses</span>
                <span className="sm:hidden font-medium">List</span>
              </TabsTrigger>
              <TabsTrigger 
                value="add" 
                className="flex flex-col items-center gap-2 py-4 px-3 text-xs sm:flex-row sm:gap-3 sm:text-sm rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Add Expense</span>
                <span className="sm:hidden font-medium">Add</span>
              </TabsTrigger>
              <TabsTrigger 
                value="members" 
                className="flex flex-col items-center gap-2 py-4 px-3 text-xs sm:flex-row sm:gap-3 sm:text-sm rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Members</span>
                <span className="sm:hidden font-medium">People</span>
              </TabsTrigger>
              <TabsTrigger 
                value="balances" 
                className="flex flex-col items-center gap-2 py-4 px-3 text-xs sm:flex-row sm:gap-3 sm:text-sm rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Calculator className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Balances</span>
                <span className="sm:hidden font-medium">Balance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settlements" 
                className="flex flex-col items-center gap-2 py-4 px-3 text-xs sm:flex-row sm:gap-3 sm:text-sm rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <ArrowRightLeft className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline font-medium">Settlements</span>
                <span className="sm:hidden font-medium">Settle</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="expenses">
            <ExpenseList key={refreshKey} onExpenseDeleted={handleDataChange} />
          </TabsContent>

          <TabsContent value="add">
            <AddExpense onExpenseAdded={handleDataChange} />
          </TabsContent>

          <TabsContent value="members">
            <MemberList onMemberAdded={handleDataChange} />
          </TabsContent>

          <TabsContent value="balances">
            <BalanceView key={refreshKey} />
          </TabsContent>

          <TabsContent value="settlements">
            <SettlementView key={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}
