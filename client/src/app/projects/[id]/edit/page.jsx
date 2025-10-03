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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api/projects";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "completed"]),
  deadline: z.string().optional(),
});

export default function EditProjectPage() {
  const { id } = useParams();
  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getProject(id),
  });

  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (project) {
      setValue("name", project.name);
      setValue("description", project.description);
      setValue("status", project.status);
      setValue(
        "deadline",
        project.deadline
          ? new Date(project.deadline).toISOString().split("T")[0]
          : ""
      );
    }
  }, [project, setValue]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data) => projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast.success("Project updated");
      router.push(`/projects/${id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Edit Project</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("name")} placeholder="Name" />
          <Textarea {...register("description")} placeholder="Description" />
          <Select
            value={watch("status")}
            onValueChange={(value) => setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Input {...register("deadline")} type="date" placeholder="Deadline" />
          <Button type="submit" disabled={mutation.isPending}>
            Update
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
