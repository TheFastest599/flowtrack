import { axios } from "./index"; // Import the configured axios

export const login = async (credentials) => {
  const response = await axios.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post("/auth/register", userData);
  return response.data;
};

export const refreshToken = async () => {
  const response = await axios.post("/auth/refresh");
  return response.data;
};

export const logout = async () => {
  const response = await axios.post("/auth/logout");
};

export default {
  login,
  register,
  refreshToken,
  logout,
};
