'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';

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

interface CartClientProps {
  initialItems: CartItem[];
  cartId: number;
}

const TAX_RATE = 0.0825; // 8.25% tax

export function CartClient({ initialItems, cartId }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + (item.items.price_cents * item.qty),
    0
  );

  // Calculate discount amount
  const discountAmount = Math.floor(subtotal * (discountPercent / 100));
  
  // Calculate tax on discounted subtotal
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.floor(taxableAmount * TAX_RATE);
  
  // Calculate grand total
  const grandTotal = taxableAmount + taxAmount;

  // Update quantity
  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    
    const item = items.find(i => i.item_id === itemId);
    if (!item) return;
    
    // Don't allow qty greater than stock
    if (newQty > item.items.stock) {
      alert(`Only ${item.items.stock} items available in stock`);
      return;
    }

    setIsUpdating(itemId);
    
    try {
      const { error } = await supabaseClient
        .from('cart_items')
        .update({ qty: newQty })
        .eq('cart_id', cartId)
        .eq('item_id', itemId);

      if (error) throw error;

      // Update local state
      setItems(items.map(i => 
        i.item_id === itemId ? { ...i, qty: newQty } : i
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setIsUpdating(null);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: number) => {
    if (!confirm('Remove this item from your cart?')) return;
    
    setIsUpdating(itemId);
    
    try {
      const { error } = await supabaseClient
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('item_id', itemId);

      if (error) throw error;

      // Update local state
      setItems(items.filter(i => i.item_id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setIsUpdating(null);
    }
  };

  // Apply discount code
  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError('');

    try {
      // Fetch discount from database
      const { data, error } = await supabaseClient
        .from('discounts')
        .select('code, pct_off, active, max_uses, used_count, expires_at')
        .eq('code', discountCode.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setDiscountError('Invalid discount code');
        setDiscountPercent(0);
        return;
      }

      // Validate discount
      if (!data.active) {
        setDiscountError('This discount code is no longer active');
        setDiscountPercent(0);
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        setDiscountError('This discount code has reached its usage limit');
        setDiscountPercent(0);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setDiscountError('This discount code has expired');
        setDiscountPercent(0);
        return;
      }

      // Apply discount
      setDiscountPercent(data.pct_off);
      setDiscountError('');
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountError('Failed to apply discount code');
      setDiscountPercent(0);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card padding="lg" className="text-center max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border border-purple-100">
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cart Items */}
      <Card padding="none" className="bg-white/90 backdrop-blur-sm border border-purple-100">
        <div className="p-6 border-b border-purple-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h2>
        </div>
        <div className="divide-y divide-purple-100">
          {items.map((item) => (
            <div key={item.item_id} className="p-6 flex flex-col sm:flex-row gap-4">
              {/* Item Image */}
              <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg overflow-hidden">
                {item.items.img_url ? (
                  <img 
                    src={item.items.img_url} 
                    alt={item.items.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-300">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-900">{item.items.name}</h3>
                <p className="text-sm text-gray-500">
                  ${(item.items.price_cents / 100).toFixed(2)} each
                </p>
                <p className="text-sm text-gray-500">
                  {item.items.stock > 0 ? (
                    <span className="text-green-600 font-medium">In stock ({item.items.stock} available)</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  )}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.item_id, item.qty - 1)}
                    disabled={item.qty <= 1 || isUpdating === item.item_id}
                    aria-label="Decrease quantity"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    −
                  </Button>
                  <span className="w-12 text-center font-semibold text-gray-900">{item.qty}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.item_id, item.qty + 1)}
                    disabled={item.qty >= item.items.stock || isUpdating === item.item_id}
                    aria-label="Increase quantity"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    +
                  </Button>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    ${((item.items.price_cents * item.qty) / 100).toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.item_id)}
                    disabled={isUpdating === item.item_id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-300 text-purple-600 hover:bg-purple-50">
              ← Continue Shopping
            </Button>
          </Link>
        </div>

        <Card padding="md" className="bg-white/90 backdrop-blur-sm border border-purple-100">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Order Summary</h3>
          
          {/* Discount Code Input */}
          <div className="mb-4 space-y-2">
            <Input
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              error={discountError}
              disabled={isApplyingDiscount}
              className="border-purple-200 focus:ring-purple-500"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
              onClick={applyDiscount}
              disabled={isApplyingDiscount || !discountCode.trim()}
            >
              {isApplyingDiscount ? 'Applying...' : 'Apply Discount'}
            </Button>
            {discountPercent > 0 && !discountError && (
              <p className="text-sm text-green-600 font-medium">
                ✓ {discountPercent}% discount applied!
              </p>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-purple-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${(subtotal / 100).toFixed(2)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount ({discountPercent}%):</span>
                <span>-${(discountAmount / 100).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-600">
              <span>Tax (8.25%):</span>
              <span>${(taxAmount / 100).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-purple-200">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Total:</span>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">${(grandTotal / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/checkout-ex">
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
