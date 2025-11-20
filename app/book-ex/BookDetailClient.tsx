'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { generateBookMetadata, generateAuthorBio } from '@/lib/bookMetadata';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDescriptionAccordion, setShowDescriptionAccordion] = useState(false);
  const [showAuthorAccordion, setShowAuthorAccordion] = useState(false);
  const [showDetailsAccordion, setShowDetailsAccordion] = useState(false);
  const { showToast } = useToast();

  // Generate personalized metadata for this book
  const bookMetadata = generateBookMetadata(item.name, item.created_at);
  const authorBio = generateAuthorBio(item.name);

  // Track recently viewed books
  useEffect(() => {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const bookData = { id: item.id, name: item.name, price_cents: item.price_cents, img_url: item.img_url };
    
    // Remove if already exists
    const filtered = recentlyViewed.filter((book: any) => book.id !== item.id);
    
    // Add to front, keep only last 6
    const updated = [bookData, ...filtered].slice(0, 6);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [item.id]);

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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${item.name}!`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      instagram: `https://www.instagram.com/` // Instagram doesn't support direct sharing URLs, opens Instagram homepage
    };

    if (platform === 'instagram') {
      // Instagram doesn't have a web sharing API, so we open Instagram and show a toast
      window.open(shareUrls[platform], '_blank');
      showToast('Copy the link and share on Instagram!', 'info');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      showToast('Opening share dialog...', 'info');
    }
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
                  <>
                    <img 
                      src={item.img_url} 
                      alt={item.name}
                      className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setShowImageModal(true)}
                    />
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                      title="View larger image"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                  </>
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
                      <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 text-center text-lg font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= item.stock}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Share Buttons */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Share this book:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('x')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </button>
                  <button
                    onClick={() => handleShare('pinterest')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                    </svg>
                    Pinterest
                  </button>
                  <button
                    onClick={() => handleShare('instagram')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Details Accordions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Description Accordion */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShowDescriptionAccordion(!showDescriptionAccordion)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Book Description</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${showDescriptionAccordion ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDescriptionAccordion && (
              <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {bookMetadata.description}
                </p>
              </div>
            )}
          </div>

          {/* Author Bio Accordion */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShowAuthorAccordion(!showAuthorAccordion)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">About the Author</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${showAuthorAccordion ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAuthorAccordion && (
              <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                <p>
                  {authorBio}
                </p>
              </div>
            )}
          </div>

          {/* Product Details Accordion */}
          <div>
            <button
              onClick={() => setShowDetailsAccordion(!showDetailsAccordion)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${showDetailsAccordion ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDetailsAccordion && (
              <div className="px-6 pb-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">ISBN</dt>
                    <dd className="text-gray-600">978-0-{Math.floor(Math.random() * 99999999)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Pages</dt>
                    <dd className="text-gray-600">{Math.floor(Math.random() * 400) + 200} pages</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Publisher</dt>
                    <dd className="text-gray-600">Bookstore Publishing</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Publication Date</dt>
                    <dd className="text-gray-600">{new Date(bookMetadata.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Language</dt>
                    <dd className="text-gray-600">English</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Dimensions</dt>
                    <dd className="text-gray-600">6 x 9 inches</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Weight</dt>
                    <dd className="text-gray-600">{(Math.random() * 2 + 0.5).toFixed(1)} lbs</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900 mb-1">Binding</dt>
                    <dd className="text-gray-600">Paperback</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          {/* Overall Rating */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {(bookMetadata.reviews.reduce((sum, r) => sum + r.rating, 0) / bookMetadata.reviews.length).toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-2 text-yellow-400">
                {[...Array(5)].map((_, i) => {
                  const avgRating = bookMetadata.reviews.reduce((sum, r) => sum + r.rating, 0) / bookMetadata.reviews.length;
                  return (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-current' : i < avgRating ? 'fill-current opacity-50' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  );
                })}
              </div>
              <div className="text-sm text-gray-600 mt-1">Based on {bookMetadata.reviews.length} reviews</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = bookMetadata.reviews.filter(r => r.rating === rating).length;
                const percentage = (count / bookMetadata.reviews.length) * 100;
                return (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-12">{rating} star</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {bookMetadata.reviews.map((review, idx) => (
              <div key={idx} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
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

      {/* Image Zoom Modal */}
      {item.img_url && (
        <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} size="xl">
          <div className="flex items-center justify-center p-4">
            <img 
              src={item.img_url} 
              alt={item.name}
              className="max-w-full max-h-[80vh] rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
