import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Member } from "~backend/expense/types";
import { Users, Plus, User, Trash2, UserPlus, Calendar } from "lucide-react";

interface MemberListProps {
  onMemberAdded: () => void;
}

export function MemberList({ onMemberAdded }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a member name",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      await backend.expense.addMember({
        name: newMemberName.trim(),
      });

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      setNewMemberName("");
      loadMembers();
      onMemberAdded();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    setDeletingId(memberId);
    try {
      await backend.expense.deleteMember({ id: memberId });
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
      loadMembers();
      onMemberAdded();
    } catch (error) {
      console.error("Failed to delete member:", error);
      toast({
        title: "Error",
        description: "Cannot delete member who has expenses or splits",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-600 text-lg">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add new member */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            Add New Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="memberName" className="sr-only">
                Member Name
              </Label>
              <Input
                id="memberName"
                placeholder="Enter member name (e.g., John Smith)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
                className="border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
              />
            </div>
            <Button 
              onClick={handleAddMember} 
              disabled={adding}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {adding ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              Travel Group Members
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                No members yet
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Add your first member to start tracking expenses. Each member can pay for expenses and be part of splits.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 relative group"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={deletingId === member.id}
                    className="absolute top-3 right-3 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-4 pr-16">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{member.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Joined {formatDate(member.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
