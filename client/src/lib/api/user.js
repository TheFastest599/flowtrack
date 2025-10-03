import { axios } from "./index"; // Import the configured axios

export const me = async () => {
  const response = await axios.get("/users/me");
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await axios.get("/users", { params });
  return response.data;
};
