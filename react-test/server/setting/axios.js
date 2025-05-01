import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8091/api",
  timeout: 30000, // 요청 타임아웃 설정 (10초)
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터를 추가
api.interceptors.request.use((config) => {
  // 요청 URL이 특정 패턴에 해당하면 다른 baseURL로 변경
  if (config.url.includes('/spring/')) {
    config.baseURL = "http://localhost:8091/api"; // 다른 서버로 보낼 URL
    config.url = config.url.replace('/spring/', '/'); // URL에서 '/spring' 제거
  }
  
  if (config.url.includes('/python/')) {
    config.baseURL = "http://192.168.10.95:5001/api"; // 다른 서버로 보낼 URL
    config.url = config.url.replace('/python/', '/'); // URL에서 '/spring' 제거
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
