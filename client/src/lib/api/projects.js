import { axios } from "./index"; // Import the configured axios

export const projectsApi = {
  // Create project
  createProject: async (data) => {
    const response = await axios.post("/projects", data);
    return response.data;
  },

  // List projects
  getProjects: async (params = {}) => {
    const response = await axios.get("/projects", { params });
    return response.data;
  },

  // Get single project
  getProject: async (projectId) => {
    const response = await axios.get(`/projects/${projectId}`);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, data) => {
    const response = await axios.put(`/projects/${projectId}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    await axios.delete(`/projects/${projectId}`);
  },

  // Get project progress
  getProjectProgress: async (projectId) => {
    const response = await axios.get(`/projects/${projectId}/progress`);
    return response.data;
  },

  // Get project members
  getMembers: async (projectId, params = {}) => {
    const response = await axios.get(`/projects/${projectId}/members`, {
      params,
    });
    return response.data;
  },

  // Add member to project
  addMember: async (projectId, userId) => {
    await axios.post(`/projects/${projectId}/members/${userId}`);
  },

  // Remove member from project
  removeMember: async (projectId, userId) => {
    await axios.delete(`/projects/${projectId}/members/${userId}`);
  },
};
