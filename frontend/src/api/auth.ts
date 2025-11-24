// API for authentication using Google OAuth

import api from './axios';

export const googleLogin = async () => {
    const response = await api.get('/auth/google/login');
    console.log(response.data);
    return response.data;
};

export const googleCallback = async (code: string, state: string) => {
    const response = await api.get('/auth/google/callback', { params: { code, state } });
    console.log(response.data);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
    });
    return response.data;
};