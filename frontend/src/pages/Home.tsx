// Home page to show all products

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import type { Product } from '../types/product';

export default function HomePage() {
    const { data, isLoading, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) {
        console.error('Query error:', error);
        return <div>Error: {error instanceof Error ? error.message : 'Failed to load products'}</div>;
    }
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data format:', data);
        return <div>No products found or invalid data format</div>;
    }

    return (
        <>
            <h1 className="text-2xl font-bold text-center">Products</h1>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((product: Product) => (
                        <div key={product.id}>
                            <h2>{product.name}</h2>
                            <p>{product.description}</p>
                            <p>{product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

