"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { tasksApi } from "@/lib/api/tasks";
import { projectsApi } from "@/lib/api/projects";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    deadline: "",
    project_id: "",
    assigned_to: "",
  });

  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");

  // Fetch projects with search
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", debouncedProjectSearch],
    queryFn: () =>
      projectsApi.getProjects({
        limit: 20,
        query: debouncedProjectSearch || undefined,
      }),
    enabled: !!debouncedProjectSearch,
  });

  // Fetch project members with search (only when project is selected)
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["project-members", formData.project_id, debouncedUserSearch],
    queryFn: () =>
      projectsApi.getMembers(formData.project_id, {
        search: debouncedUserSearch || undefined,
      }),
    enabled: !!formData.project_id && !!debouncedUserSearch,
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task created successfully");
      router.push("/tasks");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project_id) {
      toast.error("Please select a project");
      return;
    }
    createMutation.mutate({
      ...formData,
      deadline: formData.deadline || null,
      assigned_to: formData.assigned_to || null,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset assigned_to when project changes
      if (field === "project_id" && value !== prev.project_id) {
        newData.assigned_to = "";
        setUserSearch("");
        setSelectedUserName("");
      }
      return newData;
    });
  };

  // Project options for combobox
  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.name,
    })) || [];

  // User options for combobox
  const userOptions =
    members?.map((user) => ({
      value: user.id,
      label: user.name,
    })) || [];

  if (user?.role !== "admin") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Access denied. Admin only.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            placeholder="Enter task title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter task description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange("deadline", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="project_id">Project *</Label>
          {selectedProjectName && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedProjectName}
              </span>
            </div>
          )}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="pl-10"
              disabled={createMutation.isPending}
            />
          </div>
          {debouncedProjectSearch && projectsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {debouncedProjectSearch &&
            !projectsLoading &&
            projectOptions.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projectOptions.map((project) => (
                  <div
                    key={project.value}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      handleChange("project_id", project.value);
                      setProjectSearch("");
                      setSelectedProjectName(project.label);
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {project.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div>
          <Label htmlFor="assigned_to">Assigned To</Label>
          {selectedUserName && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {selectedUserName}
              </span>
            </div>
          )}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10"
              disabled={!formData.project_id || createMutation.isPending}
            />
          </div>
          {debouncedUserSearch && membersLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {debouncedUserSearch && !membersLoading && userOptions.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userOptions.map((user) => (
                <div
                  key={user.value}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    handleChange("assigned_to", user.value);
                    setUserSearch("");
                    setSelectedUserName(user.label);
                  }}
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.label}</p>
                    {user.value && (
                      <p className="text-sm text-gray-500">
                        {members?.find((m) => m.id === user.value)?.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!formData.project_id && (
            <p className="text-sm text-gray-500 mt-1">
              Select a project to enable user assignment
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Task
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/tasks")}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
