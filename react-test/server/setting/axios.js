import axios from "axios";
import os from "os";

const api = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 30000, // 요청 타임아웃 설정 (10초)
  headers: {
    "Content-Type": "application/json",
  },
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
          // 내부 주소 및 IPv6 제외
          if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
          }
      }
  }
  return 'localhost';
}

// 요청 인터셉터를 추가
api.interceptors.request.use((config) => {
  const myIp = getLocalIP();
  // 요청 URL이 특정 패턴에 해당하면 다른 baseURL로 변경
  if (config.url.includes('/spring/')) {
    config.baseURL = `http://${myIp}:8091/api`; // 다른 서버로 보낼 URL
    config.url = config.url.replace('/spring/', '/'); // URL에서 '/spring' 제거
  }
  
  if (config.url.includes('/python/')) {
    config.baseURL = `http://${myIp}:5001/api`; // 다른 서버로 보낼 URL
    config.url = config.url.replace('/python/', '/'); // URL에서 '/spring' 제거
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
