// Product Detail/Edit page for admin

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct, useUpdateProduct } from '../../../hooks/useProducts';
import type { ProductUpdateData } from '../../../api/products';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const productId = id ? parseInt(id, 10) : 0;
    
    const { data: product, isLoading, error } = useProduct(productId);
    const updateProductMutation = useUpdateProduct();
    
    const [formData, setFormData] = useState<ProductUpdateData>({
        name: '',
        description: '',
        price: 0,
        is_active: true,
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEditing, setIsEditing] = useState(false);

    // Populate form when product loads
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                is_active: product.is_active,
            });
        }
    }, [product]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                    type === 'number' ? parseFloat(value) || 0 : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Product name is required';
        }
        
        if (!formData.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (formData.price !== undefined && formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            await updateProductMutation.mutateAsync({
                id: productId,
                data: formData
            });
            setIsEditing(false);
            // Product will be refetched automatically via React Query
        } catch (err) {
            console.error('Failed to update product:', err);
            alert('Failed to update product. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                            <p className="text-gray-600">Loading product...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">Product not found or failed to load.</span>
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="mt-4 text-sm underline"
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Products
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Edit Product' : 'Product Details'}
                        </h1>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Product Images */}
                {product.media && product.media.length > 0 && (
                    <div className="mb-6 bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {product.media.map((media) => (
                                <img
                                    key={media.id}
                                    src={media.s3_url}
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded-md"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                    {/* Name */}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </>
                        ) : (
                            <p className="text-gray-900">{product.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        {isEditing ? (
                            <>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </>
                        ) : (
                            <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price ($) *
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price || 0}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                            </>
                        ) : (
                            <p className="text-gray-900">${product.price.toFixed(2)}</p>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="mb-6">
                        <label className="flex items-center">
                            {isEditing ? (
                                <>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active ?? true}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Product is active</span>
                                </>
                            ) : (
                                <span className="text-sm text-gray-700">
                                    Status: {product.is_active ? (
                                        <span className="text-green-600 font-medium">Active</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">Inactive</span>
                                    )}
                                </span>
                            )}
                        </label>
                    </div>

                    {/* Metadata */}
                    {!isEditing && (
                        <div className="mb-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(product.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Updated:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(product.updated_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end gap-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset form data
                                    if (product) {
                                        setFormData({
                                            name: product.name,
                                            description: product.description,
                                            price: product.price,
                                            is_active: product.is_active,
                                        });
                                    }
                                    setErrors({});
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateProductMutation.isPending}
                                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
