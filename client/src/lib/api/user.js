import { axios } from "./index"; // Import the configured axios
import { useAuthStore } from "@/stores/authStore";

const { token } = useAuthStore.getState();

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export const me = async () => {
  const response = await axios.get("/users/me");
  return response.data;
};
