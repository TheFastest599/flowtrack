"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute"; // Wrap for admin-only

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.string(),
  deadline: z.string().optional(), // Add this (ISO date string)
});

export default function CreateProjectPage() {
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(schema),
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project created");
      router.push("/projects");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Create Project</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("name")} placeholder="Name" />
          <Textarea {...register("description")} placeholder="Description" />
          <Select onValueChange={(value) => setValue("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Input {...register("deadline")} type="date" placeholder="Deadline" />{" "}
          <Button type="submit" disabled={mutation.isPending}>
            Create
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
