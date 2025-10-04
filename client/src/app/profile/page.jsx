"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Shield } from "lucide-react";
import { me } from "@/lib/api/user";

export default function ProfilePage() {
  // Fetch current user data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", "me"],
    queryFn: me,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load profile: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto p-4 mt-52">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Name:</span>
            <span>{user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Role:</span>
            <span className="capitalize">{user?.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
