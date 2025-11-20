// Home page to show all products

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';
import type { Product } from '../types/product';

export default function HomePage() {
    const { data, isLoading, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (error) {
        console.error('Query error:', error);
        return <div className="flex justify-center items-center min-h-screen">Error: {error instanceof Error ? error.message : 'Failed to load products'}</div>;
    }
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data format:', data);
        return <div className="flex justify-center items-center min-h-screen">No products found or invalid data format</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((product: Product) => (
                        <div 
                            key={product.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
                        >
                            {/* Product Image Container */}
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                {product.media && product.media.length > 0 ? (
                                    <img 
                                        src={product.media[0].s3_url} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Discount Badge (optional - you can add discount logic later) */}
                                {/* <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold">
                                    -15%
                                </div> */}
                                
                                {/* Action Icons */}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {/* Wishlist Icon */}
                                    <button className="bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors">
                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                    {/* Quick View Icon */}
                                    <button className="bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors">
                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    {/* Add to Cart Icon */}
                                    <button className="bg-white rounded-full p-2 shadow-md hover:bg-green-50 transition-colors">
                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                                    {product.name}
                                </h3>
                                
                                {/* Price Section */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {/* Original Price (if discounted) */}
                                        {/* <span className="text-sm text-gray-500 line-through">
                                            $66.76
                                        </span> */}
                                    </div>
                                    {/* Add to Cart Button */}
                                    <button className="bg-gray-900 text-white rounded-full p-2 hover:bg-gray-800 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

