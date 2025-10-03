"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Edit,
  Calendar,
  User,
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { tasksApi } from "@/lib/api/tasks";
import { projectsApi } from "@/lib/api/projects";
import { getUsers } from "@/lib/api/user";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const {
    data: task,
    isLoading: taskLoading,
    error: taskError,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.getTask(id),
  });

  const { data: project } = useQuery({
    queryKey: ["project", task?.project_id],
    queryFn: () => projectsApi.getProject(task.project_id),
    enabled: !!task,
  });

  const { data: assignee } = useQuery({
    queryKey: ["user", task?.assigned_to],
    queryFn: () =>
      getUsers().then((users) => users.find((u) => u.id === task.assigned_to)),
    enabled: !!task?.assigned_to,
  });

  if (taskLoading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;
  if (taskError)
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{taskError.message}</AlertDescription>
      </Alert>
    );

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-4">
            <Badge
              variant={
                task.status === "done"
                  ? "default"
                  : task.status === "in_progress"
                  ? "secondary"
                  : "outline"
              }
              className="flex items-center gap-1"
            >
              {task.status === "done" && <CheckCircle className="h-3 w-3" />}
              {task.status === "in_progress" && <Clock className="h-3 w-3" />}
              {task.status === "todo" && <AlertTriangle className="h-3 w-3" />}
              {task.status.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge
              variant={
                task.priority === "high"
                  ? "destructive"
                  : task.priority === "medium"
                  ? "default"
                  : "secondary"
              }
              className="flex items-center gap-1"
            >
              <Flag className="h-3 w-3" />
              {task.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href={`/tasks/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned To</p>
              <p className="text-lg font-semibold">
                {assignee?.name || "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Project</p>
              <Link
                href={`/projects/${task.project_id}`}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {project?.name || "Unknown Project"}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Deadline</p>
              <p className="text-lg font-semibold">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-lg font-semibold">
                {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold">
                {new Date(task.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {task.description || "No description provided."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
