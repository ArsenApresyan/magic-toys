import type { User } from "./user";

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