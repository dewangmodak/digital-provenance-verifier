import axios from 'axios';

// 1. Create an axios instance with your backend's Base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// 2. Add a 'request interceptor'
// This runs AUTOMATICALLY before every request goes out to the backend
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // If we have a token, put it in the Authorization header
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req;
});

export default API;