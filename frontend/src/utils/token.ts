// Utility functions for working with tokens

// Get the token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Set the token in localStorage
export const setToken = (token: string) => {
    localStorage.setItem('token', token);
};

// Remove the token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Verify the token is valid isTokenValid() - Check if token exists (optional: decode and check expiration)
export const isTokenValid = (token: string) => {
    return !!token;
};