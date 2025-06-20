const localHosts = ['localhost', '127.0.0.1', '::1'];
const currentHost = window.location.hostname;

const API_BASE_URL = localHosts.includes(currentHost)
  ? "http://localhost:3000/api"
  : "https://g47pzrrn-3000.usw3.devtunnels.ms/api";

export default API_BASE_URL;
