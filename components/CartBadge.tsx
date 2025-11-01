'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export function CartBadge() {
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    async function fetchCartCount() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        setItemCount(0);
        return;
      }

      // Get user's cart
      const { data: cart } = await supabaseClient
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        setItemCount(0);
        return;
      }

      // Count items in cart
      const { data: items } = await supabaseClient
        .from('cart_items')
        .select('quantity')
        .eq('cart_id', cart.id);

      const total = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setItemCount(total);
    }

    fetchCartCount();

    // Subscribe to cart changes
    const channel = supabaseClient
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
        },
        () => {
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  if (itemCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
      {itemCount > 9 ? '9+' : itemCount}
    </span>
  );
}
