"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Loader2,
  Users,
  FolderOpen,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.getDashboard(),
  });

  const adminStatus = isAdmin();

  const projects = dashboardData?.projects || [];
  const tasks = dashboardData?.tasks || [];
  const stats = dashboardData?.stats || {};

  const totalTasks = stats.total_tasks || 0;
  const completedTasks = stats.completed_tasks || 0;
  const inProgressTasks = stats.in_progress_tasks || 0;
  const todoTasks = stats.todo_tasks || 0;

  const taskStatusData = [
    { name: "Todo", value: todoTasks, color: "#6B7280" },
    { name: "In Progress", value: inProgressTasks, color: "#F59E0B" },
    { name: "Done", value: completedTasks, color: "#10B981" },
  ];

  const taskStatusConfig = {
    value: {
      label: "Tasks",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}! Here's your workspace summary.
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
              {user?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {adminStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                className="flex flex-col items-center p-4 border rounded hover:bg-gray-50"
                onClick={() => router.push("/projects/new")}
              >
                <Plus className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">New Project</span>
              </button>
              <button
                className="flex flex-col items-center p-4 border rounded hover:bg-gray-50"
                onClick={() => router.push("/projects/new")}
              >
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Add Task</span>
              </button>
              <button
                className="flex flex-col items-center p-4 border rounded hover:bg-gray-50"
                onClick={() => router.push("/reports")}
              >
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">View Reports</span>
              </button>
              <button
                className="flex flex-col items-center p-4 border rounded hover:bg-gray-50"
                onClick={() => router.push("/profile")}
              >
                <Users className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium">Manage Team</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Projects
                </p>
                <p className="text-2xl font-bold">
                  {stats.total_projects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full bg-gray-400" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Todo Tasks
                </p>
                <p className="text-2xl font-bold">{todoTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Chart */}
      {totalTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taskStatusConfig}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* My Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardLoading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center p-4 border rounded"
                >
                  <div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p>No projects assigned.</p>
          )}
        </CardContent>
      </Card>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardLoading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : tasks.length > 0 ? (
            <div className="grid gap-4">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center p-4 border rounded"
                >
                  <div>
                    <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">{task.title}</Link>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.status === "done"
                        ? "default"
                        : task.status === "in_progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  And {tasks.length - 5} more tasks...
                </p>
              )}
            </div>
          ) : (
            <p>No tasks assigned.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
