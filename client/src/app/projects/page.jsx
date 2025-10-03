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
import { projectsApi } from "@/lib/api/projects";
import Link from "next/link";
import { toast } from "sonner"; // Assuming you have sonner for toasts

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", skip: 0, limit: 10 });

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsApi.getProjects(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      toast("Project deleted successfully", { type: "success" });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFilterChange = (key, value) => {
    if (key === "status" && value === "all") value = ""; // Map "all" back to empty for API
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
        <h1 className="text-3xl font-bold">Projects</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <Select
          value={filters.status || "all"} // Show "all" if empty
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>{" "}
            {/* Changed from "" to "all" */}
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects?.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Link
                  href={`/projects/${project.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {project.name}
                </Link>
              </TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>{project.created_by}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projects/${project.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${project.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(project.id)}
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

      {/* Pagination (basic) */}
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
