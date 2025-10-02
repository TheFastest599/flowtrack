import axios from "axios";

axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
axios.defaults.withCredentials = true; // Include cookies for refresh token

export { axios };
