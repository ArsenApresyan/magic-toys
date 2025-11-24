// Utility functions for working with tokens

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Access token functions
export const getToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setToken = (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// Refresh token functions
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

// Remove tokens from localStorage
export const removeToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Verify the token is valid isTokenValid() - Check if token exists (optional: decode and check expiration)
export const isTokenValid = (token: string) => {
    return !!token;
};

// Decode JWT token to check expiration
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        // Consider token expired if it expires within 5 minutes
        return exp < (now + 5 * 60 * 1000);
    } catch (error) {
        return true;
    }
};