import { axios } from "./index"; // Import the configured axios

export const dashboardApi = {
  getDashboard: async () => (await axios.get("/dashboard")).data,
};
