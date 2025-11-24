// Custom hook for product operations
// Uses React Query for caching and state management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../api/products';
import type { ProductCreateData, ProductUpdateData } from '../api/products';

// Query keys for React Query
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
};

// Hook to fetch all products
export const useProducts = (skip: number = 0, limit: number = 100) => {
    return useQuery({
        queryKey: productKeys.list({ skip, limit }),
        queryFn: () => getProducts(skip, limit),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Hook to fetch single product
export const useProduct = (id: number) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => getProduct(id),
        enabled: !!id, // Only fetch if id exists
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Hook to create product
export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: ProductCreateData) => createProduct(data),
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

// Hook to update product
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductUpdateData }) => 
            updateProduct(id, data),
        onSuccess: (data) => {
            // Invalidate queries for this product and the list
            queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

// Hook to delete product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: (_, deletedId) => {
            // Remove the deleted product from cache
            queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
        onError: (error) => {
            console.error('Delete product error:', error);
        },
    });
};

