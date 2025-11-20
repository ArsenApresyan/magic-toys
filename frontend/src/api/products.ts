// API for products

import axios from 'axios';
import type { Product } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/products`;

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<Product[]>(API_URL);
        // Ensure we got an array
        if (!Array.isArray(response.data)) {
            throw new Error('Invalid response format: expected an array');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        if (axios.isAxiosError(error)) {
            console.error('Request URL:', API_URL);
            console.error('Response:', error.response?.data);
        }
        throw error;
    }
};

export const getProduct = async (id: number): Promise<Product> => {
    const response = await axios.get<Product>(`${API_URL}/${id}`);
    return response.data;
};