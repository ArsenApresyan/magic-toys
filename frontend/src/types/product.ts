// Type definitions for Product based on backend ProductResponse schema

import type { User } from "./user";

export interface ProductMedia {
    id: number;
    product_id: number;
    s3_url: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    created_by_id?: number | null;
    created_by?: User | null;
    updated_by_id?: number | null;
    updated_by?: User | null;
    created_at: string;
    updated_at: string;
    media?: ProductMedia[] | null;
}

// Form data types for creating/updating products
export interface ProductFormData {
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    images?: File[];
}

