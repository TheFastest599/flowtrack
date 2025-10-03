"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Search, UserPlus, UserMinus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { projectsApi } from "@/lib/api/projects";
import { getUsers } from "@/lib/api/user";
import Link from "next/link";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ManageMembersPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getProject(id),
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["projectMembers", id],
    queryFn: () => projectsApi.getMembers(id),
  });

  const { data: searchedUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["users", debouncedSearchTerm],
    queryFn: () => getUsers({ search: debouncedSearchTerm, limit: 20 }),
    enabled: !!debouncedSearchTerm,
  });

  const addMutation = useMutation({
    mutationFn: ({ userId }) => projectsApi.addMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectMembers", id]);
      toast("Member added successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId }) => projectsApi.removeMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["projectMembers", id]);
      toast("Member removed successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  // Removed internal admin check, using ProtectedRoute instead

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const memberIds = members?.map((m) => m.id) || [];
  const availableUsers =
    searchedUsers?.filter((u) => !memberIds.includes(u.id)) || [];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
            <p className="text-gray-600 mt-1">
              {project?.name} - {project?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
            {/* Current Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserMinus className="h-5 w-5 mr-2" />
                  Current Members ({members?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : members?.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <p className="text-sm text-gray-500">{m.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            removeMutation.mutate({ userId: m.id })
                          }
                          disabled={removeMutation.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No members assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Add Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {debouncedSearchTerm ? (
                  usersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : availableUsers.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {u.name}
                            </p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addMutation.mutate({ userId: u.id })}
                            disabled={addMutation.isPending}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No users found matching "{debouncedSearchTerm}".
                    </p>
                  )
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Start typing to search for users to add.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
