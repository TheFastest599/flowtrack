"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit } from "lucide-react";
import { getUser } from "@/lib/api/user";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function UserInfoPage() {
  const { id } = useParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  if (isLoading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">User Information</h1>
          <Button asChild>
            <Link href={`/members/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{user?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="text-lg">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <div className="mt-1">
                <Badge
                  variant={user?.role === "admin" ? "default" : "secondary"}
                >
                  {user?.role}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created At
              </label>
              <p className="text-lg">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-lg">
                {user?.updated_at
                  ? new Date(user.updated_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
