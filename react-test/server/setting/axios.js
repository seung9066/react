import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000, // 요청 타임아웃 설정 (10초)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
export { api };