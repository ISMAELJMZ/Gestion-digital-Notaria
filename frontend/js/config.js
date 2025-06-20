const localHosts = ['localhost', '127.0.0.1', '::1'];
const currentHost = window.location.hostname;

const API_BASE_URL = localHosts.includes(currentHost)
  ? "http://localhost:3000/api"
  : " https://notaria-publica-172.onrender.com/api";

export default API_BASE_URL;
