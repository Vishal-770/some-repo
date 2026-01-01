import axios from "axios";

const Base_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

const api = axios.create({
  baseURL: Base_URL,
});
export default api;