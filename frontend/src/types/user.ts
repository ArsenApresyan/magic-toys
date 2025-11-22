export interface User {
    id: number;
    email: string;
    name: string;
    picture?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    updated_at: string;
}