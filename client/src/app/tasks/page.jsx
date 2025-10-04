"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { tasksApi } from "@/lib/api/tasks";
import { projectsApi } from "@/lib/api/projects";
import Link from "next/link";
import { toast } from "sonner";

export default function TasksPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    project_id: "",
    skip: 0,
    limit: 10,
  });

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.getTasks(filters),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getProjects({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast("Task deleted successfully", { type: "success" });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFilterChange = (key, value) => {
    if (key === "status" && value === "all") value = "";
    if (key === "priority" && value === "all") value = "";
    if (key === "project_id" && value === "all") value = "";
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;
  if (error)
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority || "all"}
          onValueChange={(value) => handleFilterChange("priority", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.project_id || "all"}
          onValueChange={(value) => handleFilterChange("project_id", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Limit"
          value={filters.limit}
          onChange={(e) => handleFilterChange("limit", e.target.value)}
          className="w-20"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {task.title}
                </Link>
              </TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.priority}</TableCell>
              <TableCell>
                <Link
                  href={`/projects/${task.project_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {projects?.find((p) => p.id === task.project_id)?.name ||
                    "Unknown"}
                </Link>
              </TableCell>
              <TableCell>{task.assigned_to_name || "Unassigned"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tasks/${task.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(task.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() =>
            handleFilterChange(
              "skip",
              Math.max(0, filters.skip - filters.limit)
            )
          }
          disabled={filters.skip === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            handleFilterChange("skip", filters.skip + filters.limit)
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
