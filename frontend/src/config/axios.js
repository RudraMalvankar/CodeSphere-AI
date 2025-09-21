import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // Do not hardcode token here; will add via interceptor
});

// Attach latest token before each request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    return config;
});

// Optional: basic 401 handler (can be expanded to trigger logout UI)
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            // Token likely invalid/expired; could dispatch a logout event
            // window.dispatchEvent(new Event('auth-expired'));
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;