import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        if (typeof (config.headers as any).set === 'function') {
            (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
            config.headers.Authorization = `Bearer ${token}`;
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isUpload = url.includes('/upload') || url.includes('/proof');
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/customer/login');

        if (error.response && (error.response.status === 401 || error.response.status === 403) && !isUpload && !isAuthEndpoint) {
            if (!isRedirecting && window.location.pathname !== '/login') {
                isRedirecting = true;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
