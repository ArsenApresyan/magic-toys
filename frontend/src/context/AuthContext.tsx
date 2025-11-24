// AuthContext for authentication

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { googleLogin, googleCallback, getCurrentUser } from '../api/auth';
import { getToken, setToken, getRefreshToken, setRefreshToken, removeToken } from '../utils/token';
import type { User } from '../types/user';
import type { AuthContextType } from '../types/auth';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const processingCallbackRef = useRef<string | null>(null); // Track ongoing callback processing

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        // Skip auth check if we're on login page
        if (window.location.pathname === '/login' || window.location.pathname === '/auth/login') {
            setLoading(false);
            return;
        }
        
        const token = getToken();
        const refreshToken = getRefreshToken();
        
        // If no tokens at all, user is not authenticated
        if (!token && !refreshToken) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userData = await getCurrentUser();
            setUser(userData);
            setError(null);
        } catch (err) {
            // Token is invalid, clear it
            // The axios interceptor will handle refresh automatically
            removeToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const initiateLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await googleLogin();
            const { authorization_url, state } = response;
            
            // Store state in sessionStorage for validation on callback
            sessionStorage.setItem('oauth_state', state);
            
            // Redirect to Google OAuth page
            window.location.href = authorization_url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initiate login');
            setLoading(false);
        }
    };

    const handleCallback = async (code: string, state: string) => {
        // Create a unique key for this callback
        const callbackKey = `${code}:${state}`;
        
        // Prevent duplicate processing (React Strict Mode causes double renders)
        if (processingCallbackRef.current === callbackKey) {
            console.log('Callback already being processed, skipping duplicate call');
            return;
        }
        
        // Mark as processing
        processingCallbackRef.current = callbackKey;
        
        try {
            setLoading(true);
            setError(null);
            
            // Validate state parameter (backend also validates, but frontend check provides early feedback)
            const storedState = sessionStorage.getItem('oauth_state');
            
            // Remove state from sessionStorage (if it exists)
            if (storedState) {
                sessionStorage.removeItem('oauth_state');
            }
            
            // Exchange code for token (backend validates state here)
            const response = await googleCallback(code, state);
            const { access_token, refresh_token } = response;
            
            // Store tokens
            setToken(access_token);
            if (refresh_token) {
                setRefreshToken(refresh_token);
            }
            
            // Fetch user info
            const userData = await getCurrentUser();
            setUser(userData);
            
            // Clear any previous errors on success
            setError(null);
            setLoading(false);
            
            // Clear processing flag on success
            processingCallbackRef.current = null;

        } catch (err) {
            // Clear processing flag on error
            processingCallbackRef.current = null;
            
            // Only set error if backend validation fails
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
            setLoading(false);
            console.error('Callback error:', err);
            
            // If backend returns 400 for invalid state, show specific message
            if (errorMessage.includes('Invalid state') || errorMessage.includes('state parameter')) {
                setError('Session expired. Please try logging in again.');
            }
  
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
        setError(null);
        window.location.href = '/login';
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        initiateLogin,
        handleCallback,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
