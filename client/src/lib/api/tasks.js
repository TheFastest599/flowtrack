import { axios } from "./index";

export const tasksApi = {
  getTasks: async (params) => (await axios.get("/tasks", { params })).data,
  getTask: async (id) => (await axios.get(`/tasks/${id}`)).data,
  createTask: async (data) => (await axios.post("/tasks", data)).data,
  updateTask: async (id, data) => (await axios.put(`/tasks/${id}`, data)).data,
  deleteTask: async (id) => axios.delete(`/tasks/${id}`),
  moveTask: async (id, status) =>
    (await axios.patch(`/tasks/${id}/move`, { new_status: status })).data,
};
