// API for products - uses configured axios instance with auth

import api from './axios';
import type { Product } from '../types/product';

export interface ProductCreateData {
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    images?: File[];
}

export interface ProductUpdateData {
    name?: string;
    description?: string;
    price?: number;
    is_active?: boolean;
}

// GET - List all products
export const getProducts = async (skip: number = 0, limit: number = 100): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', {
        params: { skip, limit }
    });
    return response.data;
};

// GET - Get single product by ID
export const getProduct = async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

// POST - Create new product with images
export const createProduct = async (data: ProductCreateData): Promise<Product> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('is_active', data.is_active.toString());
    
    // Append images if provided
    if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
            formData.append('images', image);
        });
    }
    
    const response = await api.post<Product>('/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// PUT - Update product
export const updateProduct = async (id: number, data: ProductUpdateData): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
};

// DELETE - Delete product
export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
};