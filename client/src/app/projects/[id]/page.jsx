"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Edit } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { projectsApi } from "@/lib/api/projects";
import { tasksApi } from "@/lib/api/tasks";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getProject(id),
  });

  const { data: progress } = useQuery({
    queryKey: ["projectProgress", id],
    queryFn: () => projectsApi.getProjectProgress(id),
    enabled: !!project,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", { project_id: id }],
    queryFn: () => tasksApi.getTasks({ project_id: id }),
    enabled: !!project,
  });

  if (projectLoading)
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;
  if (projectError)
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{projectError.message}</AlertDescription>
      </Alert>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {isAdmin && (
          <Button asChild>
            <Link href={`/projects/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Description:</strong> {project.description}
          </p>
          <p>
            <strong>Status:</strong> {project.status}
          </p>
          <p>
            <strong>Created By:</strong> {project.created_by}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Total Tasks:</strong> {progress?.total_tasks || 0}
            </p>
            <p>
              <strong>Completed Tasks:</strong> {progress?.completed_tasks || 0}
            </p>
            <p>
              <strong>Progress:</strong> {progress?.progress || 0}% Complete
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks?.length ? (
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {task.title}
                  </Link>{" "}
                  - {task.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
