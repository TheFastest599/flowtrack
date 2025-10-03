"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { reportsApi } from "@/lib/api/reports";
import { projectsApi } from "@/lib/api/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, Users, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getProjects(),
  });

  const filteredProjects =
    projects?.filter((project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const { data: projectProgress, isLoading: progressLoading } = useQuery({
    queryKey: ["projectProgress", selectedProject],
    queryFn: () => reportsApi.getProjectProgress(selectedProject),
    enabled: !!selectedProject,
  });

  const { data: teamPerformance, isLoading: teamLoading } = useQuery({
    queryKey: ["teamPerformance"],
    queryFn: () => reportsApi.getTeamPerformance(),
    enabled: isAdmin,
  });

  const { data: workload, isLoading: workloadLoading } = useQuery({
    queryKey: ["workload"],
    queryFn: () => reportsApi.getWorkload(),
    enabled: isAdmin,
  });

  const progressData = projectProgress
    ? [
        { name: "Todo", value: projectProgress.todo_tasks, color: "#6B7280" },
        {
          name: "In Progress",
          value: projectProgress.in_progress_tasks,
          color: "#F59E0B",
        },
        {
          name: "Done",
          value: projectProgress.completed_tasks,
          color: "#10B981",
        },
      ]
    : [];

  const teamData =
    teamPerformance?.map((user) => ({
      name: user.user_name,
      completed: user.completed_tasks,
      total: user.total_tasks,
      rate: user.completion_rate,
    })) || [];

  const workloadData =
    workload?.map((user) => ({
      name: user.user_name,
      high: user.high_priority_tasks,
      medium: user.medium_priority_tasks,
      low: user.low_priority_tasks,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600">
          Analytics and insights for projects and team performance.
        </p>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Input
              type="text"
              placeholder="Search and select a project..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              className="w-64"
            />
            {showDropdown && searchTerm && filteredProjects.length > 0 && (
              <div className="absolute z-10 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project.id);
                      setSearchTerm(project.name);
                      setShowDropdown(false);
                    }}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedProject &&
            (progressLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : projectProgress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {projectProgress.total_tasks}
                    </p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {projectProgress.completed_tasks}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {projectProgress.in_progress_tasks}
                    </p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {projectProgress.todo_tasks}
                    </p>
                    <p className="text-sm text-gray-600">Todo</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p>No data available.</p>
            ))}
        </CardContent>
      </Card>

      {/* Team Performance - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : teamData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" stackId="a" fill="#10B981" />
                      <Bar dataKey="total" stackId="a" fill="#6B7280" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-4">
                  {teamData.map((user) => (
                    <div
                      key={user.name}
                      className="flex justify-between items-center p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {user.completed}/{user.total} tasks completed
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {user.rate}% completion rate
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No team data available.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workload Distribution - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workloadLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : workloadData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="high" stackId="a" fill="#EF4444" />
                      <Bar dataKey="medium" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="low" stackId="a" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-4">
                  {workloadData.map((user) => (
                    <div
                      key={user.name}
                      className="flex justify-between items-center p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          High: {user.high}, Medium: {user.medium}, Low:{" "}
                          {user.low}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {user.high + user.medium + user.low} total tasks
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No workload data available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
