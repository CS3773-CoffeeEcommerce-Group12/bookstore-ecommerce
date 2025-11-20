'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface BookItem {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
  img_url?: string;
  active: boolean;
  created_at?: string;
}

interface BookDetailClientProps {
  item: BookItem;
  relatedBooks: Array<{
    id: string;
    name: string;
    price_cents: number;
    img_url?: string;
    stock: number;
  }>;
  isAuthenticated: boolean;
  addToCartAction: (formData: FormData) => Promise<void>;
}

export function BookDetailClient({ 
  item, 
  relatedBooks, 
  isAuthenticated,
  addToCartAction 
}: BookDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { showToast } = useToast();

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= item.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please sign in to add items to cart', 'warning');
      return;
    }

    setIsAddingToCart(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addToCartAction(formData);
      showToast(`Added ${quantity} ${quantity === 1 ? 'book' : 'books'} to cart!`, 'success');
    } catch (error) {
      showToast('Failed to add to cart. Please try again.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    showToast(
      isFavorited ? 'Removed from wishlist' : 'Added to wishlist!', 
      isFavorited ? 'info' : 'success'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700">
              Catalog
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate max-w-xs">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Catalog
        </Link>

        {/* Main Content - Hero Layout */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left: Book Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {item.img_url ? (
                  <img 
                    src={item.img_url} 
                    alt={item.name}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Book Details */}
            <div className="flex flex-col space-y-6">
              {/* Title and Favorite */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {item.name}
                </h1>
                <button
                  onClick={toggleFavorite}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg 
                    className={`w-7 h-7 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    fill={isFavorited ? "currentColor" : "none"}
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-slate-700">
                  ${(item.price_cents / 100).toFixed(2)}
                </span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {item.stock > 0 ? (
                  <>
                    <span className="flex items-center text-green-600 font-medium">
                      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      In Stock
                    </span>
                    <span className="text-gray-500">({item.stock} available)</span>
                  </>
                ) : (
                  <span className="flex items-center text-red-600 font-medium">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Add to Cart Form */}
              <form onSubmit={handleAddToCart} className="space-y-6">
                <input type="hidden" name="item_id" value={item.id} />
                <input type="hidden" name="qty" value={quantity} />

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 text-center text-lg font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= item.stock}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={item.stock === 0 || isAddingToCart}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center"
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <Link
                    href="/cart"
                    className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-lg text-center"
                  >
                    View Cart
                  </Link>
                </div>
              </form>

              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free shipping on orders over $25
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  30-day return policy
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ships within 2-3 business days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/book-ex?id=${book.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    {book.img_url ? (
                      <img 
                        src={book.img_url} 
                        alt={book.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {book.name}
                    </h3>
                    <p className="text-lg font-bold text-slate-700">
                      ${(book.price_cents / 100).toFixed(2)}
                    </p>
                    {book.stock > 0 ? (
                      <span className="text-xs text-green-600 mt-1 inline-block">In Stock</span>
                    ) : (
                      <span className="text-xs text-gray-400 mt-1 inline-block">Out of Stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
