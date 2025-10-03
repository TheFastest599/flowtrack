import { axios } from "./index";

export const reportsApi = {
  // Get project progress report
  getProjectProgress: async (projectId) =>
    (await axios.get(`/reports/project/${projectId}`)).data,

  // Get team performance report (admin only)
  getTeamPerformance: async () =>
    (await axios.get("/reports/team-performance")).data,

  // Get workload distribution report (admin only)
  getWorkload: async () => (await axios.get("/reports/workload")).data,
};
