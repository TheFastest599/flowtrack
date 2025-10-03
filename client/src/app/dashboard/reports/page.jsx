"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";

export default function ReportsPage() {
  const { user } = useAuthStore();

  // For admin, show team performance and workload
  const { data: teamPerformance, isLoading: loadingTeam } = useQuery({
    queryKey: ["reports", "team-performance"],
    queryFn: () => reportsApi.getTeamPerformance(),
    enabled: user?.role === "admin",
  });

  const { data: workload, isLoading: loadingWorkload } = useQuery({
    queryKey: ["reports", "workload"],
    queryFn: () => reportsApi.getWorkload(),
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>
        <p>You do not have permission to view reports.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTeam ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {teamPerformance?.map((report) => (
                  <div
                    key={report.user_id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{report.user_name}</p>
                      <p className="text-sm text-gray-500">
                        {report.completed_tasks}/{report.total_tasks} tasks
                        completed
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{report.completion_rate}%</Badge>
                      <Progress
                        value={report.completion_rate}
                        className="w-20 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWorkload ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {workload?.map((report) => (
                  <div key={report.user_id}>
                    <p className="font-medium">{report.user_name}</p>
                    <p className="text-sm text-gray-500">
                      Total tasks: {report.assigned_tasks}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="destructive">
                        High: {report.high_priority_tasks}
                      </Badge>
                      <Badge variant="secondary">
                        Medium: {report.medium_priority_tasks}
                      </Badge>
                      <Badge variant="outline">
                        Low: {report.low_priority_tasks}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
