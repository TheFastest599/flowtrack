"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, deleteUser } from "@/lib/api/user";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member"]),
});

export default function EditUserPage() {
  const { id } = useParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
  });

  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role);
    }
  }, [user, setValue]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const updateMutation = useMutation({
    mutationFn: (data) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", id]);
      toast.success("User updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast.success("User deleted");
      router.push("/users");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data) => updateMutation.mutate(data);

  if (isLoading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Edit User</h1>
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input {...register("name")} placeholder="Name" />
              <Input {...register("email")} placeholder="Email" type="email" />
              <Select
                value={watch("role")}
                onValueChange={(value) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  Update
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
