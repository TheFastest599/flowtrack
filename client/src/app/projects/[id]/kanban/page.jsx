"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { tasksApi } from "@/lib/api/tasks";
import { projectsApi } from "@/lib/api/projects";
import { getUsers } from "@/lib/api/user";
import Link from "next/link";
import { toast } from "sonner";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";

const columns = [
  { id: "todo", name: "To Do", color: "#6B7280" },
  { id: "in_progress", name: "In Progress", color: "#F59E0B" },
  { id: "done", name: "Done", color: "#10B981" },
];

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default function ProjectKanbanPage() {
  const { id: projectId } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getProject(projectId),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", { project_id: projectId }],
    queryFn: () => tasksApi.getTasks({ project_id: projectId, limit: 100 }),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  const [tasks, setTasks] = useState([]);
  const [draggedTaskInitialColumn, setDraggedTaskInitialColumn] =
    useState(null);

  useEffect(() => {
    if (tasksData) {
      const formattedTasks = tasksData.map((task) => ({
        id: task.id,
        name: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        column: task.status,
        assigned_to: task.assigned_to,
        owner: users?.find((u) => u.id === task.assigned_to),
      }));
      setTasks(formattedTasks);
    }
  }, [tasksData, users]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }) => tasksApi.moveTask(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task moved");
    },
    onError: (error, variables) => {
      // Revert the local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === variables.taskId
            ? { ...t, column: variables.initialColumn }
            : t
        )
      );
      toast.error(error.message);
    },
  });

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setDraggedTaskInitialColumn(task?.column);
  };

  const handleTasksChange = (newTasks) => {
    setTasks(newTasks);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t.id === active.id);
    if (
      task &&
      draggedTaskInitialColumn &&
      draggedTaskInitialColumn !== task.column
    ) {
      // Moved to a different column
      const newStatus = task.column;
      updateTaskMutation.mutate({
        taskId: active.id,
        status: newStatus,
        initialColumn: draggedTaskInitialColumn,
      });
    }
  };

  if (projectLoading || tasksLoading) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-8" />;
  }

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{project?.name} - Kanban Board</h1>
          {project?.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href={`/tasks/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Link>
          </Button>
        )}
      </div>

      <KanbanProvider
        columns={columns}
        data={tasks}
        onDataChange={handleTasksChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id} className="min-h-[60vh]">
            <KanbanHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span>{column.name}</span>
                </div>
                <Badge variant="secondary">
                  {tasks.filter((t) => t.column === column.id).length}
                </Badge>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(task) => (
                <KanbanCard
                  column={column.id}
                  id={task.id}
                  key={task.id}
                  name={task.name}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="flex-1 font-medium text-sm hover:underline"
                      >
                        {task.name}
                      </Link>
                      {task.owner && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-xs">
                            {task.owner.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={getPriorityBadgeVariant(task.priority)}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      {task.deadline && (
                        <p className="m-0 text-muted-foreground text-xs">
                          Due{" "}
                          {shortDateFormatter.format(new Date(task.deadline))}
                        </p>
                      )}
                    </div>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
