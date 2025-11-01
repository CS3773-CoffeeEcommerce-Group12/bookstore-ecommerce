import { supabaseServer } from '@/lib/supabase/server';
import { CartClient } from './CartClient';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

interface CartItem {
  cart_id: number;
  item_id: number;
  qty: number;
  items: {
    id: number;
    name: string;
    price_cents: number;
    img_url: string;
    stock: number;
  };
}

export default async function CartPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-purple-50 p-6 flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-purple-100">
          <svg className="w-16 h-16 mx-auto text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your shopping cart.</p>
          <Link href="/auth-ex">
            <Button size="lg" className="w-full">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Fetch user's cart
  const { data: cart, error: cartErr } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (cartErr) {
    return (
      <div className="min-h-screen bg-purple-50 p-6 flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-purple-100">
          <div className="text-red-600 mb-4">Error loading cart: {cartErr.message}</div>
          <Link href="/">
            <Button variant="outline">Back to Catalog</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // If no cart exists, show empty state
  if (!cart) {
    return (
      <div className="min-h-screen bg-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">🛒 Shopping Cart</h1>
          <Card padding="lg" className="text-center bg-white/80 backdrop-blur-sm border border-purple-100">
            <div className="py-12">
              <svg className="w-24 h-24 mx-auto text-purple-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some books to get started!</p>
              <Link href="/">
                <Button size="lg">Browse Books</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch cart items with product details
  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      cart_id,
      item_id,
      qty,
      items:items!inner (
        id,
        name,
        price_cents,
        img_url,
        stock
      )
    `)
    .eq('cart_id', cart.id)
    .order('item_id') as { data: CartItem[] | null; error: any };

  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 p-6 flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center bg-white/80 backdrop-blur-sm border border-purple-100">
          <div className="text-red-600 mb-4">Error loading cart items: {error.message}</div>
          <Link href="/">
            <Button variant="outline">Back to Catalog</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">🛒 Shopping Cart</h1>
        <CartClient initialItems={items || []} cartId={cart.id} />
      </div>
    </div>
  );
}
