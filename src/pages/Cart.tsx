import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem as CartItemType, Item } from '@/types';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select('*, items(*)')
        .eq('cart_id', cart.id);

      if (error) throw error;
      return data as (CartItemType & { items: Item })[];
    },
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, newQty }: { itemId: string; newQty: number }) => {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (newQty === 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart!.id)
          .eq('item_id', itemId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ qty: newQty })
          .eq('cart_id', cart!.id)
          .eq('item_id', itemId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
    onError: () => {
      toast.error('Failed to update cart');
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.items.price_cents * item.qty,
    0
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-md p-8 bg-card rounded-xl shadow-medium border border-border">
          <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Sign in to view your cart</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your shopping cart and checkout
          </p>
          <Link to="/auth">
            <Button size="lg">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-md p-8 bg-card rounded-xl shadow-medium border border-border">
          <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any books yet
          </p>
          <Link to="/catalog">
            <Button size="lg">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.item_id}
                className="bg-card rounded-xl p-6 border border-border shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className="flex gap-6">
                  <img
                    src={item.items.img_url || '/placeholder.svg'}
                    alt={item.items.name}
                    className="h-32 w-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <Link to={`/book/${item.item_id}`}>
                      <h3 className="text-xl font-bold text-foreground hover:text-accent transition-colors">
                        {item.items.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Various Authors</p>
                    <p className="text-lg font-bold text-accent mt-2">
                      ${(item.items.price_cents / 100).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.item_id,
                              newQty: item.qty - 1,
                            })
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.item_id,
                              newQty: item.qty + 1,
                            })
                          }
                          disabled={item.qty >= item.items.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          updateQuantityMutation.mutate({
                            itemId: item.item_id,
                            newQty: 0,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      ${((item.items.price_cents * item.qty) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border shadow-medium">
              <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">${(subtotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-foreground text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">${(subtotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full mb-4"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Link to="/catalog">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
