import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  id: number;
  name: string;
  price_cents: number;
  img_url: string;
  author?: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(savedWishlist);
  }, []);

  const removeFromWishlist = (bookId: number) => {
    const updated = wishlistItems.filter(item => item.id !== bookId);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  return (
    <main className="min-h-screen bg-purple-50 p-4 sm:p-6 lg:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-pink-600 fill-pink-600" />
          <div>
            <h1 className="text-4xl font-bold text-purple-600">My Wishlist</h1>
            <p className="text-gray-600">Books you've saved for later</p>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding books you love!</p>
            <Link to="/catalog">
              <Button className="bg-purple-600 hover:bg-indigo-700">
                Browse Catalog
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Link to={`/book/${item.id}`}>
                  <div className="relative w-full h-48 bg-gray-100">
                    {item.img_url ? (
                      <img
                        src={item.img_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Heart className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 space-y-2">
                  <Link to={`/book/${item.id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  {item.author && (
                    <p className="text-sm text-gray-600">{item.author}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${(item.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/book/${item.id}`} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-indigo-700" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                      className="border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
