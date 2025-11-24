import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, isTokenExpired } from '../utils/token';
import { refreshAccessToken } from './auth';

// Axios instance for the API to get all methods like get, post, put, delete, etc.
import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // Skip token refresh for auth endpoints (login, callback, refresh)
    const isAuthEndpoint = config.url?.includes('/auth/') || config.url?.includes('/google/');
    
    // Skip token refresh if we're on the login page
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/auth/login';
    
    let token = getToken();
    
    // Check if token is expired and refresh if needed
    // Only refresh if NOT on login page and NOT an auth endpoint
    if (token && isTokenExpired(token) && !isLoginPage && !isAuthEndpoint) {
        const refreshToken = getRefreshToken();
        if (refreshToken && !isRefreshing) {
            isRefreshing = true;
            try {
                const response = await refreshAccessToken(refreshToken);
                token = response.access_token;
                setToken(response.access_token);
                setRefreshToken(response.refresh_token);
                isRefreshing = false;
                processQueue(null, token);
            } catch (error) {
                isRefreshing = false;
                processQueue(error as AxiosError, null);
                removeToken();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        } else if (isRefreshing) {
            // Wait for the ongoing refresh to complete
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken: any) => {
                if (config.headers) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                }
                return config;
            }).catch((err) => {
                return Promise.reject(err);
            });
        }
    }
    
    // Don't add token to auth endpoints
    if (token && config.headers && !isAuthEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Skip refresh logic for auth endpoints and login page
        const isAuthEndpoint = originalRequest.url?.includes('/auth/') || originalRequest.url?.includes('/google/');
        const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/auth/login';
        
        // If we get a 401 and haven't retried yet, try to refresh the token
        // But skip if it's an auth endpoint or we're on login page
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && !isLoginPage) {
            if (isRefreshing) {
                // Wait for the ongoing refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token: any) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    originalRequest._retry = true;
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                removeToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
            
            try {
                const response = await refreshAccessToken(refreshToken);
                const newAccessToken = response.access_token;
                setToken(newAccessToken);
                setRefreshToken(response.refresh_token);
                isRefreshing = false;
                processQueue(null, newAccessToken);
                
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError as AxiosError, null);
                removeToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
export default api;
