import { axios } from "./index"; // Import the configured axios

export const me = async () => {
  const response = await axios.get("/users/me");
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await axios.get("/users", { params });
  return response.data;
};

export const getUser = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await axios.put(`/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  await axios.delete(`/users/${userId}`);
};
