"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Edit } from "lucide-react";
import { getUsers } from "@/lib/api/user";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 100,
    search: "",
    role: "",
  });

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleRoleChange = (value) => {
    setFilters((prev) => ({ ...prev, role: value === "all" ? "" : value }));
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Members</h1>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />
      ) : error ? (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        className="hover:underline font-medium"
                        href={`/members/${user.id}`}
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/members/${user.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
