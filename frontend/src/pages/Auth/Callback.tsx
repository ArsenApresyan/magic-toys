// OAuth Callback page - handles Google OAuth redirect

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleCallback, error, isAuthenticated } = useAuth();
    const [processing, setProcessing] = useState(true);
    const processedRef = useRef(false); // Guard against duplicate processing

    useEffect(() => {
        // Prevent duplicate processing (React Strict Mode causes double renders)
        if (processedRef.current) {
            return;
        }

        const processCallback = async () => {
            try {
                // Extract code and state from URL (URLSearchParams automatically decodes)
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');

                // Debug logging
                console.log('Callback received:', {
                    hasCode: !!code,
                    hasState: !!state,
                    stateValue: state,
                    errorParam
                });

                // Check if user denied access
                if (errorParam) {
                    throw new Error('Access denied. Please try again.');
                }

                // Validate required parameters
                if (!code || !state) {
                    throw new Error('Missing authorization code or state parameter.');
                }

                // Mark as processed before making the API call
                processedRef.current = true;

                // Handle the callback
                await handleCallback(code, state);
                setProcessing(false);
            } catch (err) {
                console.error('Callback error:', err);
                setProcessing(false);
                // Error is handled by AuthContext
            }
        };

        processCallback();
    }, [searchParams, handleCallback]);

    // Redirect on successful authentication
    useEffect(() => {
        if (isAuthenticated && !processing && !error) {
            const timer = setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, processing, error]);

    if (processing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-gray-600">Completing authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
                    <div className="text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md transition-colors"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}

