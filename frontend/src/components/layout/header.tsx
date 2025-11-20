// Header component

import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-3xl font-bold">
                            <span className="text-red-500">t</span>
                            <span className="text-green-400">o</span>
                            <span className="text-orange-500">y</span>
                            <span className="text-blue-400">s</span>
                            {/* <span className="text-blue-400">l</span> */}
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link 
                            to="/" 
                            className="text-pink-500 hover:text-pink-500 transition-colors flex items-center gap-1"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/shop" 
                            className="text-gray-900 hover:text-pink-500 transition-colors flex items-center gap-1"
                        >
                            Shop
                        </Link>
                        <Link 
                            to="/blog" 
                            className="text-gray-900 hover:text-pink-600 transition-colors flex items-center gap-1 font-medium"
                        >
                            Blog
                        </Link>
                        <Link 
                            to="/contact" 
                            className="text-gray-900 hover:text-pink-500 transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Right Side Icons and Cart */}
                    <div className="flex items-center gap-4">
                        {/* Search Icon */}
                        <button className="text-gray-700 hover:text-pink-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User Account Icon */}
                        <button className="text-gray-700 hover:text-pink-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        {/* Shopping Cart Button */}
                        <div className="flex items-center">
                            <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-l-lg transition-colors flex items-center">
                                <span className="text-sm font-medium">Cart: 0 Items</span>
                            </button>
                            <button className="bg-black text-white p-2.5 rounded-r-lg hover:bg-gray-800 transition-colors flex items-center justify-center w-10 h-10">
                                {/* Shopping Cart Icon */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}