import type { User } from "./user";

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    refresh_token_expires_in: number;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    initiateLogin: () => Promise<void>;
    handleCallback: (code: string, state: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}